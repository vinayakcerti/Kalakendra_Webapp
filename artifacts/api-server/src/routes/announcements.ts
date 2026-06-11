import { Router, type IRouter } from "express";
import { eq, desc, sql, or, isNull, gte } from "drizzle-orm";
import { db, announcementsTable } from "@workspace/db";

const router: IRouter = Router();

/** GET /announcements — list all (admin) or active-only (public/portal via ?active=true) */
router.get("/announcements", async (req, res) => {
  const activeOnly = req.query["active"] === "true";
  const today = new Date().toISOString().split("T")[0];

  const rows = await db
    .select()
    .from(announcementsTable)
    .where(
      activeOnly
        ? or(
            isNull(announcementsTable.expiresAt),
            gte(announcementsTable.expiresAt, today)
          )
        : undefined
    )
    .orderBy(
      sql`${announcementsTable.pinned} DESC`,
      desc(announcementsTable.createdAt)
    );

  res.json(rows);
});

/** POST /announcements */
router.post("/announcements", async (req, res) => {
  const { title, body, type, pinned, expiresAt } = req.body as {
    title: string;
    body: string;
    type?: string;
    pinned?: boolean;
    expiresAt?: string | null;
  };

  if (!title?.trim() || !body?.trim()) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }

  const [row] = await db
    .insert(announcementsTable)
    .values({
      title: title.trim(),
      body: body.trim(),
      type: type ?? "info",
      pinned: pinned ?? false,
      expiresAt: expiresAt ?? null,
    })
    .returning();

  res.status(201).json(row);
});

/** PATCH /announcements/:id */
router.patch("/announcements/:id", async (req, res) => {
  const { title, body, type, pinned, expiresAt } = req.body as {
    title?: string;
    body?: string;
    type?: string;
    pinned?: boolean;
    expiresAt?: string | null;
  };

  const [row] = await db
    .update(announcementsTable)
    .set({
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(body !== undefined ? { body: body.trim() } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(pinned !== undefined ? { pinned } : {}),
      ...(expiresAt !== undefined ? { expiresAt: expiresAt ?? null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(announcementsTable.id, req.params.id))
    .returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

/** DELETE /announcements/:id */
router.delete("/announcements/:id", async (req, res) => {
  await db.delete(announcementsTable).where(eq(announcementsTable.id, req.params.id));
  res.status(204).send();
});

export default router;
