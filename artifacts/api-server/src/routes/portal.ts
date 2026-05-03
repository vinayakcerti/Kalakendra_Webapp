import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";
import {
  db,
  studentsTable,
  batchesTable,
  feesTable,
  attendanceTable,
} from "@workspace/db";
import { logger } from "../lib/logger";
import { sendMagicLink, sendPaymentNotification, sendEmailVerification } from "../lib/email";
import { settingsTable } from "@workspace/db";

declare module "express-session" {
  interface SessionData {
    studentId: string;
  }
}

const router: IRouter = Router();

// ─── Middleware: require session ───────────────────────────────────────────

function requirePortalAuth(
  req: Parameters<Parameters<IRouter["use"]>[0]>[0],
  res: Parameters<Parameters<IRouter["use"]>[0]>[1],
  next: Parameters<Parameters<IRouter["use"]>[0]>[2]
) {
  if (!req.session?.studentId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// ─── POST /portal/auth/request — send magic link ──────────────────────────

router.post("/portal/auth/request", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email required" });
    return;
  }

  const normalised = email.trim().toLowerCase();

  const [student] = await db
    .select({ id: studentsTable.id, fullName: studentsTable.fullName, status: studentsTable.status })
    .from(studentsTable)
    .where(
      and(
        eq(sql`lower(${studentsTable.primaryContactEmail})`, normalised),
        eq(studentsTable.status, "active")
      )
    )
    .limit(1);

  // Always return 200 to avoid email enumeration
  if (!student) {
    req.log.info({ email: normalised }, "Portal auth request — no matching student");
    res.json({ sent: true });
    return;
  }

  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await db.execute(
    sql`INSERT INTO student_tokens (student_id, token, expires_at)
        VALUES (${student.id}, ${token}, ${expiresAt.toISOString()})`
  );

  const baseUrl = (process.env["REPLIT_DOMAINS"] ?? "").split(",")[0]?.trim();
  const base = baseUrl ? `https://${baseUrl}` : "http://localhost:80";
  const link = `${base}/portal/verify?token=${token}`;

  await sendMagicLink({ to: normalised, studentName: student.fullName, link });
  req.log.info({ studentId: student.id }, "Magic link sent");
  res.json({ sent: true });
});

// ─── GET /portal/auth/verify?token= — exchange token for session ──────────

router.get("/portal/auth/verify", async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) { res.status(400).json({ error: "token required" }); return; }

  const [row] = await db.execute<{
    id: string; student_id: string; used_at: string | null; expires_at: string;
  }>(sql`
    SELECT id, student_id, used_at, expires_at
    FROM student_tokens
    WHERE token = ${token}
    LIMIT 1
  `);

  if (!row) { res.status(401).json({ error: "Invalid token" }); return; }
  if (row.used_at) { res.status(401).json({ error: "Token already used" }); return; }
  if (new Date(row.expires_at) < new Date()) { res.status(401).json({ error: "Token expired" }); return; }

  // Mark used
  await db.execute(sql`
    UPDATE student_tokens SET used_at = NOW() WHERE id = ${row.id}
  `);

  req.session.studentId = row.student_id;
  req.session.save((err) => {
    if (err) { res.status(500).json({ error: "Session error" }); return; }
    res.json({ ok: true, studentId: row.student_id });
  });
});

// ─── POST /portal/auth/logout ─────────────────────────────────────────────

router.post("/portal/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ─── GET /portal/me ───────────────────────────────────────────────────────

router.get("/portal/me", requirePortalAuth, async (req, res) => {
  const [student] = await db
    .select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      dob: studentsTable.dob,
      batchId: studentsTable.batchId,
      batchName: batchesTable.name,
      batchSchedule: batchesTable.schedule,
      primaryContactName: studentsTable.primaryContactName,
      primaryContactEmail: studentsTable.primaryContactEmail,
      primaryContactPhone: studentsTable.primaryContactPhone,
      status: studentsTable.status,
      enrolledAt: studentsTable.enrolledAt,
    })
    .from(studentsTable)
    .leftJoin(batchesTable, eq(studentsTable.batchId, batchesTable.id))
    .where(eq(studentsTable.id, req.session.studentId!));

  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  res.json(student);
});

// ─── POST /portal/register — self-registration by name lookup ────────────

router.post("/portal/register", async (req, res) => {
  const { fullName, email } = req.body as { fullName?: string; email?: string };
  if (!fullName?.trim() || !email?.trim()) {
    res.status(400).json({ error: "fullName and email are required" });
    return;
  }

  const normalisedEmail = email.trim().toLowerCase();
  const normalisedName  = fullName.trim().toLowerCase();

  // Find active student whose name matches (case-insensitive)
  const [student] = await db
    .select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      existingEmail: studentsTable.primaryContactEmail,
      status: studentsTable.status,
    })
    .from(studentsTable)
    .where(
      and(
        eq(sql`lower(trim(${studentsTable.fullName}))`, normalisedName),
        eq(studentsTable.status, "active")
      )
    )
    .limit(1);

  if (!student) {
    // Don't reveal whether name was found — return a discriminated result instead
    res.json({ result: "no-match" });
    return;
  }

  // If already linked to an email, tell them to use the login page
  if (student.existingEmail) {
    res.json({ result: "already-linked" });
    return;
  }

  // Create a verification token stored in portal_registration_requests
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await db.execute(sql`
    INSERT INTO portal_registration_requests (student_id, proposed_email, token, expires_at)
    VALUES (${student.id}, ${normalisedEmail}, ${token}, ${expiresAt.toISOString()})
  `);

  const baseUrl = (process.env["REPLIT_DOMAINS"] ?? "").split(",")[0]?.trim();
  const base = baseUrl ? `https://${baseUrl}` : "http://localhost:80";
  const link = `${base}/portal/register/verify?token=${token}`;

  await sendEmailVerification({ to: normalisedEmail, studentName: student.fullName, link });
  req.log.info({ studentId: student.id, email: normalisedEmail }, "Email verification sent for self-registration");

  res.json({ result: "sent" });
});

// ─── GET /portal/register/verify?token= — confirm email & log in ─────────

router.get("/portal/register/verify", async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) { res.status(400).json({ error: "token required" }); return; }

  const [row] = await db.execute<{
    id: string; student_id: string; proposed_email: string;
    used_at: string | null; expires_at: string;
  }>(sql`
    SELECT id, student_id, proposed_email, used_at, expires_at
    FROM portal_registration_requests
    WHERE token = ${token}
    LIMIT 1
  `);

  if (!row) { res.status(401).json({ error: "Invalid token" }); return; }
  if (row.used_at) { res.status(401).json({ error: "Token already used" }); return; }
  if (new Date(row.expires_at) < new Date()) { res.status(401).json({ error: "Token expired" }); return; }

  // Mark token used
  await db.execute(sql`
    UPDATE portal_registration_requests SET used_at = NOW() WHERE id = ${row.id}
  `);

  // Save email to student record
  await db
    .update(studentsTable)
    .set({ primaryContactEmail: row.proposed_email, updatedAt: new Date() })
    .where(eq(studentsTable.id, row.student_id));

  // Create session
  req.session.studentId = row.student_id;
  req.session.save((err) => {
    if (err) { res.status(500).json({ error: "Session error" }); return; }
    req.log.info({ studentId: row.student_id, email: row.proposed_email }, "Student self-registered via email verification");
    res.json({ ok: true, studentId: row.student_id });
  });
});

// ─── PATCH /portal/me — student updates their own details ────────────────

router.patch("/portal/me", requirePortalAuth, async (req, res) => {
  const body = req.body as {
    fullName?: string;
    dob?: string | null;
    primaryContactName?: string | null;
    primaryContactEmail?: string | null;
    primaryContactPhone?: string | null;
  };

  // Build update object — only include fields that were actually sent
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.fullName === "string" && body.fullName.trim()) {
    updates.fullName = body.fullName.trim();
  }
  if ("dob" in body) {
    updates.dob = body.dob ?? null;
  }
  if ("primaryContactName" in body) {
    updates.primaryContactName = typeof body.primaryContactName === "string" && body.primaryContactName.trim()
      ? body.primaryContactName.trim()
      : null;
  }
  if ("primaryContactEmail" in body) {
    const email = typeof body.primaryContactEmail === "string" ? body.primaryContactEmail.trim() : null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }
    updates.primaryContactEmail = email || null;
  }
  if ("primaryContactPhone" in body) {
    updates.primaryContactPhone = typeof body.primaryContactPhone === "string" && body.primaryContactPhone.trim()
      ? body.primaryContactPhone.trim()
      : null;
  }

  if (Object.keys(updates).length <= 1) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  const [updated] = await db
    .update(studentsTable)
    .set(updates as Parameters<typeof db.update>[0] extends infer T ? T : never)
    .where(eq(studentsTable.id, req.session.studentId!))
    .returning({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      dob: studentsTable.dob,
      batchId: studentsTable.batchId,
      primaryContactName: studentsTable.primaryContactName,
      primaryContactEmail: studentsTable.primaryContactEmail,
      primaryContactPhone: studentsTable.primaryContactPhone,
      status: studentsTable.status,
      enrolledAt: studentsTable.enrolledAt,
    });

  if (!updated) { res.status(404).json({ error: "Student not found" }); return; }

  req.log.info({ studentId: req.session.studentId }, "Student updated their own profile");
  res.json(updated);
});

// ─── GET /portal/fees ─────────────────────────────────────────────────────

router.get("/portal/fees", requirePortalAuth, async (req, res) => {
  const rows = await db
    .select({
      id: feesTable.id,
      description: feesTable.description,
      amountOre: feesTable.amountOre,
      currency: feesTable.currency,
      dueDate: feesTable.dueDate,
      paidDate: feesTable.paidDate,
      status: feesTable.status,
      notes: feesTable.notes,
      paymentReference: feesTable.paymentReference,
      createdAt: feesTable.createdAt,
    })
    .from(feesTable)
    .where(eq(feesTable.studentId, req.session.studentId!))
    .orderBy(desc(feesTable.createdAt));

  res.json(rows);
});

// ─── POST /portal/fees/:id/payment-request ────────────────────────────────

router.post("/portal/fees/:id/payment-request", requirePortalAuth, async (req, res) => {
  const { paymentReference } = req.body as { paymentReference?: string };
  if (!paymentReference || typeof paymentReference !== "string" || !paymentReference.trim()) {
    res.status(400).json({ error: "paymentReference is required" });
    return;
  }

  // Verify fee belongs to this student and is in a payable state
  const [fee] = await db
    .select({
      id: feesTable.id,
      studentId: feesTable.studentId,
      description: feesTable.description,
      amountOre: feesTable.amountOre,
      status: feesTable.status,
    })
    .from(feesTable)
    .where(
      and(
        eq(feesTable.id, req.params.id),
        eq(feesTable.studentId, req.session.studentId!)
      )
    )
    .limit(1);

  if (!fee) { res.status(404).json({ error: "Fee not found" }); return; }

  if (fee.status !== "pending" && fee.status !== "overdue") {
    res.status(409).json({ error: "Fee is not in a payable state" });
    return;
  }

  // Update fee to payment_pending with reference
  const [updated] = await db.execute<{
    id: string; description: string; amount_ore: number; currency: string;
    due_date: string | null; paid_date: string | null; status: string;
    notes: string | null; payment_reference: string | null; created_at: string;
  }>(sql`
    UPDATE fees
    SET status = 'payment_pending',
        payment_reference = ${paymentReference.trim()},
        updated_at = NOW()
    WHERE id = ${fee.id}
    RETURNING id, description, amount_ore, currency, due_date, paid_date,
              status, notes, payment_reference, created_at
  `);

  res.json({
    id: updated.id,
    description: updated.description,
    amountOre: updated.amount_ore,
    currency: updated.currency,
    dueDate: updated.due_date,
    paidDate: updated.paid_date,
    status: updated.status,
    notes: updated.notes,
    paymentReference: updated.payment_reference,
    createdAt: updated.created_at,
  });

  // Fetch student name and school contact, then notify admin (fire-and-forget)
  void (async () => {
    try {
      const [student] = await db
        .select({ fullName: studentsTable.fullName })
        .from(studentsTable)
        .where(eq(studentsTable.id, req.session.studentId!))
        .limit(1);

      const [settings] = await db
        .select({ contactEmail: settingsTable.contactEmail })
        .from(settingsTable)
        .where(eq(settingsTable.id, 1))
        .limit(1);

      if (settings?.contactEmail && student) {
        await sendPaymentNotification({
          schoolContactEmail: settings.contactEmail,
          studentName: student.fullName,
          feeDescription: fee.description,
          amountOre: fee.amountOre,
          paymentReference: paymentReference.trim(),
          feeId: fee.id,
        });
      }
    } catch (err) {
      logger.error({ err }, "Error in payment notification dispatch");
    }
  })();
});

// ─── GET /portal/attendance ───────────────────────────────────────────────

router.get("/portal/attendance", requirePortalAuth, async (req, res) => {
  const rows = await db
    .select({
      id: attendanceTable.id,
      date: attendanceTable.date,
      status: attendanceTable.status,
      notes: attendanceTable.notes,
      batchName: batchesTable.name,
    })
    .from(attendanceTable)
    .innerJoin(batchesTable, eq(attendanceTable.batchId, batchesTable.id))
    .where(eq(attendanceTable.studentId, req.session.studentId!))
    .orderBy(desc(attendanceTable.date));

  res.json(rows);
});

export default router;
