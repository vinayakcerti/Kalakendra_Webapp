import { Router, type IRouter } from "express";
import { eq, desc, ilike, and } from "drizzle-orm";
import { db, admissionsTable, studentsTable, batchesTable, settingsTable } from "@workspace/db";
import {
  ListAdmissionsQueryParams,
  CreateAdmissionBody,
  UpdateAdmissionBody,
  ListAdmissionsResponseItem,
  GetAdmissionResponse,
  UpdateAdmissionResponse,
  EnrolAdmissionBody,
  EnrolAdmissionParams,
  GetStudentResponse,
} from "@workspace/api-zod";
import { sendApplicationEmails } from "../lib/email";

const router: IRouter = Router();

/** Returns the enrolledStudentId for an admission (null if not yet enrolled). */
async function getEnrolledStudentId(admissionId: string): Promise<string | null> {
  const [existing] = await db
    .select({ id: studentsTable.id })
    .from(studentsTable)
    .where(eq(studentsTable.admissionId, admissionId))
    .limit(1);
  return existing?.id ?? null;
}

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

  // Fire-and-forget: send confirmation to applicant + admin notification
  // Runs after response is sent — never blocks or fails the request
  void (async () => {
    try {
      // Look up batch name and school contact email in parallel
      const [batchRow, settingsRow] = await Promise.all([
        body.batch
          ? db.select({ name: batchesTable.name })
              .from(batchesTable)
              .where(eq(batchesTable.code, body.batch))
              .limit(1)
              .then(r => r[0])
          : Promise.resolve(undefined),
        db.select({ contactEmail: settingsTable.contactEmail })
          .from(settingsTable)
          .where(eq(settingsTable.id, 1))
          .limit(1)
          .then(r => r[0]),
      ]);

      await sendApplicationEmails({
        admissionId: row.id,
        studentName: row.studentName,
        applicantType: row.applicantType,
        studentEmail: row.studentEmail,
        parentEmail: row.parentEmail,
        batchCode: row.batch ?? "",
        batchName: batchRow?.name ?? row.batch ?? "your chosen batch",
        schoolContactEmail: settingsRow?.contactEmail,
      });
    } catch (err) {
      req.log.error({ err }, "Error in post-admission email dispatch");
    }
  })();

  res.status(201).json(GetAdmissionResponse.parse({ ...row, enrolledStudentId: null }));
});

router.get("/admissions/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(admissionsTable)
    .where(eq(admissionsTable.id, req.params.id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const enrolledStudentId = await getEnrolledStudentId(row.id);
  res.json(GetAdmissionResponse.parse({ ...row, enrolledStudentId }));
});

router.patch("/admissions/:id", async (req, res) => {
  const body = UpdateAdmissionBody.parse(req.body);
  const [row] = await db
    .update(admissionsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(admissionsTable.id, req.params.id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const enrolledStudentId = await getEnrolledStudentId(row.id);
  res.json(UpdateAdmissionResponse.parse({ ...row, enrolledStudentId }));
});

router.delete("/admissions/:id", async (req, res) => {
  await db.delete(admissionsTable).where(eq(admissionsTable.id, req.params.id));
  res.status(204).send();
});

/** POST /admissions/:id/enrol — convert an accepted admission into a student record */
router.post("/admissions/:id/enrol", async (req, res) => {
  const { id } = EnrolAdmissionParams.parse(req.params);
  const body = EnrolAdmissionBody.parse(req.body);

  // 1. Fetch the admission
  const [admission] = await db
    .select()
    .from(admissionsTable)
    .where(eq(admissionsTable.id, id));
  if (!admission) { res.status(404).json({ error: "Admission not found" }); return; }

  // 2. Guard: must be accepted (or at least reviewed)
  if (!["accepted", "under_review"].includes(admission.status)) {
    res.status(400).json({ error: "Admission must be accepted before enrolling" }); return;
  }

  // 3. Guard: check if already enrolled
  const existing = await getEnrolledStudentId(id);
  if (existing) {
    res.status(400).json({ error: "Student already enrolled from this admission", studentId: existing }); return;
  }

  // 4. Resolve batch — prefer explicit override, else look up by code
  let batchId: string | undefined = body.batchId ?? undefined;
  if (!batchId && admission.batch) {
    const [batch] = await db
      .select({ id: batchesTable.id })
      .from(batchesTable)
      .where(eq(batchesTable.code, admission.batch))
      .limit(1);
    batchId = batch?.id;
  }

  // 5. Determine contact info (adult: student fields; child: parent fields)
  const isChild = admission.applicantType === "child";
  const contactName = isChild ? (admission.parentName ?? undefined) : undefined;
  const contactEmail = isChild
    ? (admission.parentEmail ?? undefined)
    : (admission.studentEmail ?? undefined);
  const contactPhone = isChild
    ? (admission.parentPhone ?? undefined)
    : (admission.studentPhone ?? undefined);

  // 6. Derive dob string (could be a Date object from drizzle)
  const dobStr = admission.studentDob instanceof Date
    ? admission.studentDob.toISOString().split("T")[0]
    : String(admission.studentDob);

  // 7. Create the student
  const [newStudent] = await db
    .insert(studentsTable)
    .values({
      admissionId: admission.id,
      fullName: admission.studentName,
      dob: dobStr,
      batchId: batchId ?? null,
      primaryContactName: contactName,
      primaryContactEmail: contactEmail,
      primaryContactPhone: contactPhone,
      status: "active",
    })
    .returning();

  // 8. Return the full student (with batchName)
  const [studentWithBatch] = await db
    .select({
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
    })
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, newStudent.id));

  res.status(201).json(GetStudentResponse.parse(studentWithBatch));
});

export default router;
