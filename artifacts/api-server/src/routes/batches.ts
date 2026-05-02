import { Router, type IRouter } from "express";
import { eq, count, asc, sql } from "drizzle-orm";
import { db, batchesTable, studentsTable, attendanceTable, feesTable } from "@workspace/db";
import {
  ListBatchesQueryParams,
  CreateBatchBody,
  UpdateBatchBody,
  ListBatchesResponseItem,
  UpdateBatchResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getBatchesWithCount(activeOnly?: boolean) {
  const batches = await db
    .select()
    .from(batchesTable)
    .where(activeOnly !== undefined ? eq(batchesTable.active, activeOnly) : undefined)
    .orderBy(asc(batchesTable.displayOrder));

  const counts = await db
    .select({ batchId: studentsTable.batchId, cnt: count() })
    .from(studentsTable)
    .where(eq(studentsTable.status, "active"))
    .groupBy(studentsTable.batchId);

  const countMap = new Map(counts.map((c) => [c.batchId, Number(c.cnt)]));
  return batches.map((b) => ({ ...b, studentCount: countMap.get(b.id) ?? 0 }));
}

/** GET /batches/:id — single batch with student attendance + fee summary */
router.get("/batches/:id", async (req, res) => {
  const [batch] = await db
    .select()
    .from(batchesTable)
    .where(eq(batchesTable.id, req.params.id));

  if (!batch) { res.status(404).json({ error: "Not found" }); return; }

  // Students in this batch
  const students = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.batchId, req.params.id))
    .orderBy(asc(studentsTable.fullName));

  if (students.length === 0) {
    res.json({ ...batch, students: [] });
    return;
  }

  const studentIds = students.map((s) => s.id);

  // Attendance counts per student
  const attRows = await db
    .select({
      studentId: attendanceTable.studentId,
      total: count(),
    })
    .from(attendanceTable)
    .where(eq(attendanceTable.batchId, req.params.id))
    .groupBy(attendanceTable.studentId);

  const batchId = req.params.id;
  const attPresent = await db.execute(
    sql`SELECT student_id, COUNT(*) AS cnt FROM attendance
        WHERE batch_id = ${batchId}::uuid AND status IN ('present','late') GROUP BY student_id`
  ) as unknown as { rows: { student_id: string; cnt: string }[] };

  const totalMap = new Map(attRows.map((r) => [r.studentId, Number(r.total)]));
  const presentMap = new Map(
    (attPresent.rows ?? []).map((r) => [r.student_id, Number(r.cnt)])
  );

  // Outstanding fees per student
  const studentIdList = studentIds.join("','");
  const feeRows = await db.execute(
    sql`SELECT student_id, COALESCE(SUM(amount_ore),0) AS outstanding
        FROM fees
        WHERE student_id IN (SELECT unnest(ARRAY[${sql.raw(`'${studentIdList}'`)}]::uuid[]))
          AND status IN ('pending','overdue')
        GROUP BY student_id`
  ) as unknown as { rows: { student_id: string; outstanding: string }[] };

  const feeMap = new Map(
    (feeRows.rows ?? []).map((r) => [r.student_id, Number(r.outstanding)])
  );

  const enriched = students.map((s) => {
    const total = totalMap.get(s.id) ?? 0;
    const present = presentMap.get(s.id) ?? 0;
    return {
      id: s.id,
      fullName: s.fullName,
      status: s.status,
      enrolledAt: s.createdAt,
      totalSessions: total,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : null,
      feesOutstandingOre: feeMap.get(s.id) ?? 0,
    };
  });

  res.json({ ...batch, students: enriched });
});

router.get("/batches", async (req, res) => {
  const query = ListBatchesQueryParams.parse(req.query);
  const rows = await getBatchesWithCount(
    query.active !== undefined ? query.active : undefined
  );
  res.json(rows.map((r) => ListBatchesResponseItem.parse(r)));
});

router.post("/batches", async (req, res) => {
  const body = CreateBatchBody.parse(req.body);
  const [row] = await db.insert(batchesTable).values(body).returning();
  res.status(201).json(ListBatchesResponseItem.parse({ ...row, studentCount: 0 }));
});

router.patch("/batches/:id", async (req, res) => {
  const body = UpdateBatchBody.parse(req.body);
  const [row] = await db
    .update(batchesTable)
    .set(body)
    .where(eq(batchesTable.id, req.params.id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const [enrolled] = await db
    .select({ cnt: count() })
    .from(studentsTable)
    .where(eq(studentsTable.batchId, req.params.id));
  res.json(UpdateBatchResponse.parse({ ...row, studentCount: Number(enrolled?.cnt ?? 0) }));
});

router.delete("/batches/:id", async (req, res) => {
  await db.delete(batchesTable).where(eq(batchesTable.id, req.params.id));
  res.status(204).send();
});

export default router;
