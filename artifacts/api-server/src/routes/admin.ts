import { Router, type IRouter, type RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db, adminsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedBuf = Buffer.from(hashed, "hex");
  return timingSafeEqual(buf, hashedBuf);
}

// ─── Extend session type ───────────────────────────────────────────────────

declare module "express-session" {
  interface SessionData {
    adminId: string;
  }
}

// ─── Middleware: require admin session ─────────────────────────────────────

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }
  next();
};

// ─── Router ────────────────────────────────────────────────────────────────

const router: IRouter = Router();

/**
 * POST /api/admin/setup
 * One-time first-admin creation. Only works when no admins exist yet.
 */
router.post("/admin/setup", async (req, res) => {
  try {
    const existing = await db
      .select({ id: adminsTable.id })
      .from(adminsTable)
      .limit(1);

    if (existing.length > 0) {
      res.status(403).json({ error: "Setup already completed" });
      return;
    }

    const { email, fullName, password } = req.body as {
      email?: string;
      fullName?: string;
      password?: string;
    };

    if (!email || !fullName || !password) {
      res.status(400).json({ error: "email, fullName and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const [admin] = await db
      .insert(adminsTable)
      .values({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        passwordHash,
        role: "admin",
      })
      .returning({ id: adminsTable.id, email: adminsTable.email, fullName: adminsTable.fullName });

    logger.info({ adminId: admin.id }, "First admin created via setup");
    res.status(201).json({ message: "Admin created", admin });
  } catch (err) {
    logger.error({ err }, "Admin setup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/admin/login
 * Email + password login; sets session on success.
 */
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email.trim().toLowerCase()))
      .limit(1);

    if (!admin || !admin.active) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!admin.passwordHash) {
      res.status(401).json({ error: "Account not configured for password login" });
      return;
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Update last login timestamp
    await db
      .update(adminsTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminsTable.id, admin.id));

    req.session.adminId = admin.id;

    logger.info({ adminId: admin.id }, "Admin logged in");
    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "Admin login error");
    res.status(500).json({ error: "Internal server error", detail: msg });
  }
});

/**
 * POST /api/admin/logout
 * Destroys the admin session.
 */
router.post("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) logger.error({ err }, "Session destroy error");
    res.json({ message: "Logged out" });
  });
});

/**
 * GET /api/admin/me
 * Returns the currently logged-in admin (used by the frontend to check auth state).
 */
router.get("/admin/me", requireAdmin, async (req, res) => {
  try {
    const [admin] = await db
      .select({
        id: adminsTable.id,
        email: adminsTable.email,
        fullName: adminsTable.fullName,
        role: adminsTable.role,
      })
      .from(adminsTable)
      .where(eq(adminsTable.id, req.session.adminId!))
      .limit(1);

    if (!admin) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "Session invalid" });
      return;
    }

    res.json({ admin });
  } catch (err) {
    logger.error({ err }, "Admin me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
