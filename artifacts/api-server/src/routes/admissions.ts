import { Router, type IRouter } from "express";
import { eq, desc, ilike, and } from "drizzle-orm";
import { db, admissionsTable } from "@workspace/db";
import {
  ListAdmissionsQueryParams,
  CreateAdmissionBody,
  UpdateAdmissionBody,
  ListAdmissionsResponseItem,
  GetAdmissionResponse,
  UpdateAdmissionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admissions", async (req, res) => {
  const query = ListAdmissionsQueryParams.parse(req.query);
  const conditions = [];
  if (query.status) conditions.push(eq(admissionsTable.status, query.status));
  if (query.batch) conditions.push(eq(admissionsTable.batch, query.batch));
  if (query.search) conditions.push(ilike(admissionsTable.studentName, `%${query.search}%`));

  const rows = await db
    .select()
    .from(admissionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(admissionsTable.submittedAt));

  res.json(rows.map((r) => ListAdmissionsResponseItem.parse(r)));
});

router.post("/admissions", async (req, res) => {
  const body = CreateAdmissionBody.parse(req.body);
  const [row] = await db
    .insert(admissionsTable)
    .values({
      applicantType: body.applicantType,
      studentName: body.studentName,
      studentDob: body.studentDob instanceof Date
        ? body.studentDob.toISOString().split("T")[0]
        : String(body.studentDob),
      studentGender: body.studentGender,
      studentEmail: body.studentEmail,
      studentPhone: body.studentPhone,
      parentName: body.parentName,
      parentRelationship: body.parentRelationship,
      parentEmail: body.parentEmail,
      parentPhone: body.parentPhone,
      emergencyName: body.emergencyName,
      emergencyPhone: body.emergencyPhone,
      addressStreet: body.addressStreet,
      addressPostal: body.addressPostal,
      addressCity: body.addressCity,
      batch: body.batch,
      experience: body.experience,
      experienceDetails: body.experienceDetails,
      joiningDate: body.joiningDate instanceof Date
        ? body.joiningDate.toISOString().split("T")[0]
        : body.joiningDate ? String(body.joiningDate) : undefined,
      medicalNotes: body.medicalNotes,
      willStagePerform: body.willStagePerform,
      motivation: body.motivation,
      referralSource: body.referralSource,
      photoConsent: body.photoConsent,
      rulesConsent: body.rulesConsent,
      suggestions: body.suggestions,
      status: "pending",
    })
    .returning();
  res.status(201).json(GetAdmissionResponse.parse(row));
});

router.get("/admissions/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(admissionsTable)
    .where(eq(admissionsTable.id, req.params.id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(GetAdmissionResponse.parse(row));
});

router.patch("/admissions/:id", async (req, res) => {
  const body = UpdateAdmissionBody.parse(req.body);
  const [row] = await db
    .update(admissionsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(admissionsTable.id, req.params.id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateAdmissionResponse.parse(row));
});

router.delete("/admissions/:id", async (req, res) => {
  await db.delete(admissionsTable).where(eq(admissionsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
