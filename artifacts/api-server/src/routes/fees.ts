import { Router, type IRouter } from "express";
import { eq, desc, and, ilike, or, inArray, sql } from "drizzle-orm";
import { db, feesTable, studentsTable, batchesTable } from "@workspace/db";
import {
  ListFeesQueryParams,
  ListAllFeesQueryParams,
  CreateFeeBody,
  UpdateFeeBody,
  ListFeesResponseItem,
  UpdateFeeResponse,
  ListAllFeesResponseItem,
  BulkCreateFeesBody,
} from "@workspace/api-zod";
import { sendFeeReminder } from "../lib/email";

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

/** POST /fees/mark-overdue — mark all pending fees with past dueDate as overdue */
router.post("/fees/mark-overdue", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const result = await db.execute(
    sql`UPDATE fees SET status = 'overdue', updated_at = NOW()
        WHERE status = 'pending' AND due_date IS NOT NULL AND due_date < ${today}::date`
  );
  res.json({ updated: (result as unknown as { rowCount: number }).rowCount ?? 0 });
});

/** POST /fees/bulk — create the same fee for all active students (optionally filtered by batch) */
router.post("/fees/bulk", async (req, res) => {
  const body = BulkCreateFeesBody.parse(req.body);

  // Fetch eligible students
  const conditions = [eq(studentsTable.status, "active")];
  if (body.batchId) conditions.push(eq(studentsTable.batchId, body.batchId));

  const students = await db
    .select({ id: studentsTable.id })
    .from(studentsTable)
    .where(and(...conditions));

  if (students.length === 0) {
    res.status(201).json({ created: 0, skipped: 0 });
    return;
  }

  // Check for existing fees with same description to skip duplicates
  const studentIds = students.map((s) => s.id);
  const existing = await db
    .select({ studentId: feesTable.studentId })
    .from(feesTable)
    .where(
      and(
        eq(feesTable.description, body.description),
        inArray(feesTable.studentId, studentIds)
      )
    );

  const existingStudentIds = new Set(existing.map((e) => e.studentId));

  const toCreate = students.filter((s) => !existingStudentIds.has(s.id));
  const skipped = students.length - toCreate.length;

  if (toCreate.length > 0) {
    await db.insert(feesTable).values(
      toCreate.map((s) => ({
        studentId: s.id,
        description: body.description,
        amountOre: body.amountOre,
        currency: "SEK",
        dueDate: body.dueDate ?? null,
        notes: body.notes ?? null,
        status: "pending" as const,
      }))
    );
  }

  res.status(201).json({ created: toCreate.length, skipped });
});

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

/** POST /fees/:id/reminder — send a fee reminder email to the student */
router.post("/fees/:id/reminder", async (req, res) => {
  // Fetch fee + student contact email
  const [row] = await db
    .select({
      id: feesTable.id,
      description: feesTable.description,
      amountOre: feesTable.amountOre,
      dueDate: feesTable.dueDate,
      status: feesTable.status,
      studentName: studentsTable.fullName,
      studentEmail: studentsTable.primaryContactEmail,
    })
    .from(feesTable)
    .innerJoin(studentsTable, eq(feesTable.studentId, studentsTable.id))
    .where(eq(feesTable.id, req.params.id));

  if (!row) { res.status(404).json({ error: "Fee not found" }); return; }
  if (!row.studentEmail) { res.status(422).json({ error: "Student has no email address" }); return; }
  if (row.status === "paid" || row.status === "waived") {
    res.status(422).json({ error: "Cannot send reminder for a paid or waived fee" });
    return;
  }

  const domain = (process.env["REPLIT_DOMAINS"] ?? "").split(",")[0]?.trim();
  const portalUrl = domain ? `https://${domain}/portal/login` : "https://kalakendra.se/portal/login";

  await sendFeeReminder({
    to: row.studentEmail,
    studentName: row.studentName,
    feeDescription: row.description,
    amountOre: row.amountOre,
    dueDate: row.dueDate ?? null,
    portalUrl,
  });

  // Record the reminder timestamp
  await db
    .update(feesTable)
    .set({ reminderSentAt: new Date(), updatedAt: new Date() })
    .where(eq(feesTable.id, req.params.id));

  res.json({ sent: true, to: row.studentEmail });
});

/** DELETE /fees/:id — delete a fee */
router.delete("/fees/:id", async (req, res) => {
  await db.delete(feesTable).where(eq(feesTable.id, req.params.id));
  res.status(204).send();
});

export default router;
