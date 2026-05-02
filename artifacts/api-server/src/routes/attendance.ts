import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db, attendanceTable, studentsTable, batchesTable } from "@workspace/db";
import {
  ListAttendanceQueryParams,
  RecordAttendanceBody,
  UpdateAttendanceBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function attendanceSelect() {
  return {
    id: attendanceTable.id,
    studentId: attendanceTable.studentId,
    studentName: studentsTable.fullName,
    batchId: attendanceTable.batchId,
    batchName: batchesTable.name,
    date: attendanceTable.date,
    status: attendanceTable.status,
    notes: attendanceTable.notes,
    createdAt: attendanceTable.createdAt,
  };
}

/** GET /attendance — list with optional filters */
router.get("/attendance", async (req, res) => {
  const query = ListAttendanceQueryParams.parse(req.query);
  const conditions = [];

  if (query.batchId) conditions.push(eq(attendanceTable.batchId, query.batchId));
  if (query.studentId) conditions.push(eq(attendanceTable.studentId, query.studentId));
  if (query.date) conditions.push(eq(attendanceTable.date, query.date));
  if (query.from) conditions.push(gte(attendanceTable.date, query.from));
  if (query.to) conditions.push(lte(attendanceTable.date, query.to));

  const rows = await db
    .select(attendanceSelect())
    .from(attendanceTable)
    .innerJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
    .innerJoin(batchesTable, eq(attendanceTable.batchId, batchesTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(attendanceTable.date);

  res.json(rows);
});

/** POST /attendance — upsert a full batch session */
router.post("/attendance", async (req, res) => {
  const body = RecordAttendanceBody.parse(req.body);

  await db
    .insert(attendanceTable)
    .values(
      body.entries.map((e) => ({
        studentId: e.studentId,
        batchId: body.batchId,
        date: body.date,
        status: e.status,
        notes: e.notes ?? null,
      }))
    )
    .onConflictDoUpdate({
      target: [attendanceTable.studentId, attendanceTable.batchId, attendanceTable.date],
      set: {
        status: sql`excluded.status`,
        notes: sql`excluded.notes`,
        updatedAt: sql`now()`,
      },
    });

  res.status(201).json({ saved: body.entries.length });
});

/** PATCH /attendance/:id */
router.patch("/attendance/:id", async (req, res) => {
  const body = UpdateAttendanceBody.parse(req.body);
  const [updated] = await db
    .update(attendanceTable)
    .set({ status: body.status, notes: body.notes ?? null, updatedAt: new Date() })
    .where(eq(attendanceTable.id, req.params.id))
    .returning({ id: attendanceTable.id });

  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [row] = await db
    .select(attendanceSelect())
    .from(attendanceTable)
    .innerJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
    .innerJoin(batchesTable, eq(attendanceTable.batchId, batchesTable.id))
    .where(eq(attendanceTable.id, req.params.id));

  res.json(row);
});

/** DELETE /attendance/:id */
router.delete("/attendance/:id", async (req, res) => {
  await db.delete(attendanceTable).where(eq(attendanceTable.id, req.params.id));
  res.status(204).send();
});

export default router;
