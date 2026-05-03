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
import { sendMagicLink } from "../lib/email";

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
      createdAt: feesTable.createdAt,
    })
    .from(feesTable)
    .where(eq(feesTable.studentId, req.session.studentId!))
    .orderBy(desc(feesTable.createdAt));

  res.json(rows);
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
