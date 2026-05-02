import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, batchesTable, studentsTable } from "@workspace/db";
import {
  CreateBatchBody,
  UpdateBatchParams,
  UpdateBatchBody,
  DeleteBatchParams,
  ListBatchesResponseItem,
  UpdateBatchResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getBatchesWithCount() {
  const batches = await db.select().from(batchesTable);
  const counts = await db
    .select({ batchId: studentsTable.batchId, cnt: count() })
    .from(studentsTable)
    .groupBy(studentsTable.batchId);

  const countMap = new Map(counts.map((c) => [c.batchId, Number(c.cnt)]));
  return batches.map((b) => ({
    ...b,
    enrolledCount: countMap.get(b.id) ?? 0,
  }));
}

router.get("/batches", async (_req, res) => {
  const rows = await getBatchesWithCount();
  res.json(rows.map((r) => ListBatchesResponseItem.parse(r)));
});

router.post("/batches", async (req, res) => {
  const body = CreateBatchBody.parse(req.body);
  const [row] = await db.insert(batchesTable).values(body).returning();
  res.status(201).json(ListBatchesResponseItem.parse({ ...row, enrolledCount: 0 }));
});

router.patch("/batches/:id", async (req, res) => {
  const { id } = UpdateBatchParams.parse({ id: Number(req.params.id) });
  const body = UpdateBatchBody.parse(req.body);
  const [row] = await db
    .update(batchesTable)
    .set(body)
    .where(eq(batchesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const [enrolled] = await db
    .select({ cnt: count() })
    .from(studentsTable)
    .where(eq(studentsTable.batchId, id));
  res.json(UpdateBatchResponse.parse({ ...row, enrolledCount: Number(enrolled?.cnt ?? 0) }));
});

router.delete("/batches/:id", async (req, res) => {
  const { id } = DeleteBatchParams.parse({ id: Number(req.params.id) });
  await db.delete(batchesTable).where(eq(batchesTable.id, id));
  res.status(204).send();
});

export default router;
