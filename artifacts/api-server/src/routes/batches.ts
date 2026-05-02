import { Router, type IRouter } from "express";
import { eq, count, asc } from "drizzle-orm";
import { db, batchesTable, studentsTable } from "@workspace/db";
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
