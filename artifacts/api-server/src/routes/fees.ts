import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, feesTable } from "@workspace/db";
import {
  ListFeesQueryParams,
  CreateFeeBody,
  UpdateFeeBody,
  ListFeesResponseItem,
  UpdateFeeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/students/:studentId/fees", async (req, res) => {
  const query = ListFeesQueryParams.parse(req.query);
  const conditions = [eq(feesTable.studentId, req.params.studentId)];
  if (query.status) conditions.push(eq(feesTable.status, query.status));

  const rows = await db
    .select()
    .from(feesTable)
    .where(conditions.length > 1 ? and(...conditions) : conditions[0])
    .orderBy(desc(feesTable.createdAt));

  res.json(rows.map((r) => ListFeesResponseItem.parse(r)));
});

router.post("/students/:studentId/fees", async (req, res) => {
  const body = CreateFeeBody.parse(req.body);
  const [row] = await db
    .insert(feesTable)
    .values({ ...body, studentId: req.params.studentId })
    .returning();
  res.status(201).json(ListFeesResponseItem.parse(row));
});

router.patch("/fees/:id", async (req, res) => {
  const body = UpdateFeeBody.parse(req.body);
  const [row] = await db
    .update(feesTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(feesTable.id, req.params.id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateFeeResponse.parse(row));
});

router.delete("/fees/:id", async (req, res) => {
  await db.delete(feesTable).where(eq(feesTable.id, req.params.id));
  res.status(204).send();
});

export default router;
