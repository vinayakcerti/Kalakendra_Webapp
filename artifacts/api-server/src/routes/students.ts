import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, studentsTable, batchesTable } from "@workspace/db";
import {
  ListStudentsQueryParams,
  CreateStudentBody,
  UpdateStudentBody,
  ListStudentsResponseItem,
  GetStudentResponse,
  UpdateStudentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function studentSelect() {
  return {
    id: studentsTable.id,
    admissionId: studentsTable.admissionId,
    fullName: studentsTable.fullName,
    dob: studentsTable.dob,
    batchId: studentsTable.batchId,
    batchName: batchesTable.name,
    primaryContactName: studentsTable.primaryContactName,
    primaryContactEmail: studentsTable.primaryContactEmail,
    primaryContactPhone: studentsTable.primaryContactPhone,
    status: studentsTable.status,
    enrolledAt: studentsTable.enrolledAt,
    createdAt: studentsTable.createdAt,
    updatedAt: studentsTable.updatedAt,
  };
}

router.get("/students", async (req, res) => {
  const query = ListStudentsQueryParams.parse(req.query);
  const conditions = [];
  if (query.batchId) conditions.push(eq(studentsTable.batchId, query.batchId));
  if (query.status) conditions.push(eq(studentsTable.status, query.status));
  if (query.search) conditions.push(ilike(studentsTable.fullName, `%${query.search}%`));

  const rows = await db
    .select(studentSelect())
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(rows.map((r) => ListStudentsResponseItem.parse(r)));
});

router.post("/students", async (req, res) => {
  const body = CreateStudentBody.parse(req.body);
  const [row] = await db.insert(studentsTable).values(body).returning();
  const [withBatch] = await db
    .select(studentSelect())
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, row.id));
  res.status(201).json(GetStudentResponse.parse(withBatch));
});

router.get("/students/:id", async (req, res) => {
  const [row] = await db
    .select(studentSelect())
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, req.params.id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(GetStudentResponse.parse(row));
});

router.patch("/students/:id", async (req, res) => {
  const body = UpdateStudentBody.parse(req.body);
  const [updated] = await db
    .update(studentsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(studentsTable.id, req.params.id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  const [withBatch] = await db
    .select(studentSelect())
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, req.params.id));
  res.json(UpdateStudentResponse.parse(withBatch));
});

router.delete("/students/:id", async (req, res) => {
  await db.delete(studentsTable).where(eq(studentsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
