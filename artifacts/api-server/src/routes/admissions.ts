import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, admissionsTable } from "@workspace/db";
import {
  ListAdmissionsQueryParams,
  CreateAdmissionBody,
  GetAdmissionParams,
  UpdateAdmissionParams,
  UpdateAdmissionBody,
  DeleteAdmissionParams,
  ListAdmissionsResponseItem,
  GetAdmissionResponse,
  UpdateAdmissionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admissions", async (req, res) => {
  const query = ListAdmissionsQueryParams.parse(req.query);
  const conditions = [];
  if (query.status) conditions.push(eq(admissionsTable.status, query.status));
  if (query.programme) conditions.push(eq(admissionsTable.programme, query.programme));

  const rows = await db
    .select()
    .from(admissionsTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(desc(admissionsTable.createdAt));

  res.json(rows.map((r) => ListAdmissionsResponseItem.parse(r)));
});

router.post("/admissions", async (req, res) => {
  const body = CreateAdmissionBody.parse(req.body);
  const [row] = await db
    .insert(admissionsTable)
    .values({ ...body, status: "pending" })
    .returning();
  res.status(201).json(GetAdmissionResponse.parse(row));
});

router.get("/admissions/:id", async (req, res) => {
  const { id } = GetAdmissionParams.parse({ id: Number(req.params.id) });
  const [row] = await db
    .select()
    .from(admissionsTable)
    .where(eq(admissionsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(GetAdmissionResponse.parse(row));
});

router.patch("/admissions/:id", async (req, res) => {
  const { id } = UpdateAdmissionParams.parse({ id: Number(req.params.id) });
  const body = UpdateAdmissionBody.parse(req.body);
  const [row] = await db
    .update(admissionsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(admissionsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateAdmissionResponse.parse(row));
});

router.delete("/admissions/:id", async (req, res) => {
  const { id } = DeleteAdmissionParams.parse({ id: Number(req.params.id) });
  await db.delete(admissionsTable).where(eq(admissionsTable.id, id));
  res.status(204).send();
});

export default router;
