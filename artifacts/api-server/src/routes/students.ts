import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, studentsTable, batchesTable } from "@workspace/db";
import {
  ListStudentsQueryParams,
  CreateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  UpdateStudentBody,
  DeleteStudentParams,
  ListStudentsResponseItem,
  GetStudentResponse,
  UpdateStudentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/students", async (req, res) => {
  const query = ListStudentsQueryParams.parse(req.query);

  const rows = await db
    .select({
      id: studentsTable.id,
      name: studentsTable.name,
      email: studentsTable.email,
      phone: studentsTable.phone,
      programme: studentsTable.programme,
      batchId: studentsTable.batchId,
      batchName: batchesTable.name,
      joinedAt: studentsTable.joinedAt,
      status: studentsTable.status,
      notes: studentsTable.notes,
    })
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(
      and(
        query.batchId ? eq(studentsTable.batchId, query.batchId) : undefined,
        query.search ? ilike(studentsTable.name, `%${query.search}%`) : undefined,
      )
    );

  res.json(rows.map((r) => ListStudentsResponseItem.parse(r)));
});

router.post("/students", async (req, res) => {
  const body = CreateStudentBody.parse(req.body);
  const [row] = await db.insert(studentsTable).values(body).returning();
  const [withBatch] = await db
    .select({
      id: studentsTable.id,
      name: studentsTable.name,
      email: studentsTable.email,
      phone: studentsTable.phone,
      programme: studentsTable.programme,
      batchId: studentsTable.batchId,
      batchName: batchesTable.name,
      joinedAt: studentsTable.joinedAt,
      status: studentsTable.status,
      notes: studentsTable.notes,
    })
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, row.id));
  res.status(201).json(GetStudentResponse.parse(withBatch));
});

router.get("/students/:id", async (req, res) => {
  const { id } = GetStudentParams.parse({ id: Number(req.params.id) });
  const [row] = await db
    .select({
      id: studentsTable.id,
      name: studentsTable.name,
      email: studentsTable.email,
      phone: studentsTable.phone,
      programme: studentsTable.programme,
      batchId: studentsTable.batchId,
      batchName: batchesTable.name,
      joinedAt: studentsTable.joinedAt,
      status: studentsTable.status,
      notes: studentsTable.notes,
    })
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(GetStudentResponse.parse(row));
});

router.patch("/students/:id", async (req, res) => {
  const { id } = UpdateStudentParams.parse({ id: Number(req.params.id) });
  const body = UpdateStudentBody.parse(req.body);
  const [row] = await db
    .update(studentsTable)
    .set(body)
    .where(eq(studentsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const [withBatch] = await db
    .select({
      id: studentsTable.id,
      name: studentsTable.name,
      email: studentsTable.email,
      phone: studentsTable.phone,
      programme: studentsTable.programme,
      batchId: studentsTable.batchId,
      batchName: batchesTable.name,
      joinedAt: studentsTable.joinedAt,
      status: studentsTable.status,
      notes: studentsTable.notes,
    })
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, id));
  res.json(UpdateStudentResponse.parse(withBatch));
});

router.delete("/students/:id", async (req, res) => {
  const { id } = DeleteStudentParams.parse({ id: Number(req.params.id) });
  await db.delete(studentsTable).where(eq(studentsTable.id, id));
  res.status(204).send();
});

export default router;
