import { Router, type IRouter } from "express";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import { db, feesTable, studentsTable, batchesTable } from "@workspace/db";
import {
  ListFeesQueryParams,
  ListAllFeesQueryParams,
  CreateFeeBody,
  UpdateFeeBody,
  ListFeesResponseItem,
  UpdateFeeResponse,
  ListAllFeesResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

function feeWithStudentSelect() {
  return {
    id: feesTable.id,
    studentId: feesTable.studentId,
    studentName: studentsTable.fullName,
    batchName: batchesTable.name,
    description: feesTable.description,
    amountOre: feesTable.amountOre,
    currency: feesTable.currency,
    dueDate: feesTable.dueDate,
    paidDate: feesTable.paidDate,
    status: feesTable.status,
    notes: feesTable.notes,
    createdAt: feesTable.createdAt,
    updatedAt: feesTable.updatedAt,
  };
}

/** GET /fees — all fees across all students with optional filters */
router.get("/fees", async (req, res) => {
  const query = ListAllFeesQueryParams.parse(req.query);
  const conditions = [];
  if (query.status) conditions.push(eq(feesTable.status, query.status));
  if (query.studentId) conditions.push(eq(feesTable.studentId, query.studentId));
  if (query.search) conditions.push(ilike(studentsTable.fullName, `%${query.search}%`));

  const rows = await db
    .select(feeWithStudentSelect())
    .from(feesTable)
    .innerJoin(studentsTable, eq(feesTable.studentId, studentsTable.id))
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(feesTable.createdAt));

  res.json(rows.map((r) => ListAllFeesResponseItem.parse(r)));
});

/** GET /students/:studentId/fees — fees for a single student */
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

/** POST /students/:studentId/fees — create fee for a student */
router.post("/students/:studentId/fees", async (req, res) => {
  const body = CreateFeeBody.parse(req.body);
  const [row] = await db
    .insert(feesTable)
    .values({ ...body, studentId: req.params.studentId })
    .returning();
  res.status(201).json(ListFeesResponseItem.parse(row));
});

/** PATCH /fees/:id — update a fee */
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

/** DELETE /fees/:id — delete a fee */
router.delete("/fees/:id", async (req, res) => {
  await db.delete(feesTable).where(eq(feesTable.id, req.params.id));
  res.status(204).send();
});

export default router;
