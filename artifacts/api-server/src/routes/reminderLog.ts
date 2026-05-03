import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { reminderJobRunsTable } from "@workspace/db/schema";

const router: IRouter = Router();

/** GET /reminder-runs — list recent reminder job executions, newest first */
router.get("/reminder-runs", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const runs = await db
    .select()
    .from(reminderJobRunsTable)
    .orderBy(desc(reminderJobRunsTable.ranAt))
    .limit(limit);

  res.json(runs);
});

export default router;
