import { Router, type IRouter } from "express";
import { eq, ilike, and, desc, isNotNull } from "drizzle-orm";
import crypto from "crypto";
import { sql } from "drizzle-orm";
import { db, studentsTable, batchesTable, studentNotesTable } from "@workspace/db";
import {
  ListStudentsQueryParams,
  CreateStudentBody,
  UpdateStudentBody,
  ListStudentsResponseItem,
  GetStudentResponse,
  UpdateStudentResponse,
  CreateStudentNoteBody,
} from "@workspace/api-zod";
import { sendPortalInvite } from "../lib/email";
import { logger } from "../lib/logger";

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

/** GET /students/:studentId/notes */
router.get("/students/:studentId/notes", async (req, res) => {
  const notes = await db
    .select()
    .from(studentNotesTable)
    .where(eq(studentNotesTable.studentId, req.params.studentId))
    .orderBy(desc(studentNotesTable.createdAt));
  res.json(notes);
});

// ─── POST /students/:id/send-invite — send portal invite to one student ──────

router.post("/students/:id/send-invite", async (req, res) => {
  const [student] = await db
    .select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      email: studentsTable.primaryContactEmail,
      status: studentsTable.status,
    })
    .from(studentsTable)
    .where(eq(studentsTable.id, req.params.id))
    .limit(1);

  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  if (!student.email) { res.status(400).json({ error: "Student has no email address on record" }); return; }

  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.execute(
    sql`INSERT INTO student_tokens (student_id, token, expires_at)
        VALUES (${student.id}, ${token}, ${expiresAt.toISOString()})`
  );

  const baseUrl = (process.env["REPLIT_DOMAINS"] ?? "").split(",")[0]?.trim();
  const base = baseUrl ? `https://${baseUrl}` : "http://localhost:80";
  const link = `${base}/portal/verify?token=${token}`;

  await sendPortalInvite({ to: student.email, studentName: student.fullName, link });
  logger.info({ studentId: student.id, email: student.email }, "Portal invite sent by admin");

  res.json({ sent: true, studentId: student.id, email: student.email });
});

// ─── POST /students/send-invites-bulk — send invites to all eligible students ─

router.post("/students/send-invites-bulk", async (req, res) => {
  const eligible = await db
    .select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      email: studentsTable.primaryContactEmail,
    })
    .from(studentsTable)
    .where(
      and(
        eq(studentsTable.status, "active"),
        isNotNull(studentsTable.primaryContactEmail)
      )
    );

  if (eligible.length === 0) {
    res.json({ sent: 0, skipped: 0 });
    return;
  }

  const baseUrl = (process.env["REPLIT_DOMAINS"] ?? "").split(",")[0]?.trim();
  const base = baseUrl ? `https://${baseUrl}` : "http://localhost:80";

  let sent = 0;
  let failed = 0;

  for (const student of eligible) {
    if (!student.email) continue;
    try {
      const token = crypto.randomBytes(48).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db.execute(
        sql`INSERT INTO student_tokens (student_id, token, expires_at)
            VALUES (${student.id}, ${token}, ${expiresAt.toISOString()})`
      );
      const link = `${base}/portal/verify?token=${token}`;
      await sendPortalInvite({ to: student.email, studentName: student.fullName, link });
      sent++;
    } catch (err) {
      logger.error({ err, studentId: student.id }, "Failed to send bulk portal invite");
      failed++;
    }
  }

  logger.info({ sent, failed, total: eligible.length }, "Bulk portal invites sent");
  res.json({ sent, failed, total: eligible.length });
});

/** POST /students/:studentId/notes */
router.post("/students/:studentId/notes", async (req, res) => {
  const body = CreateStudentNoteBody.parse(req.body);
  const [note] = await db
    .insert(studentNotesTable)
    .values({ studentId: req.params.studentId, ...body })
    .returning();
  res.status(201).json(note);
});

/** DELETE /students/:studentId/notes/:noteId */
router.delete("/students/:studentId/notes/:noteId", async (req, res) => {
  await db
    .delete(studentNotesTable)
    .where(
      and(
        eq(studentNotesTable.id, req.params.noteId),
        eq(studentNotesTable.studentId, req.params.studentId)
      )
    );
  res.status(204).send();
});

export default router;
