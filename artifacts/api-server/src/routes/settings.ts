import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import {
  UpdateSettingsBody,
  GetSettingsResponse,
  UpdateSettingsResponse,
} from "@workspace/api-zod";
import { rescheduleFromSettings } from "../jobs/dailyFeeReminder";

const router: IRouter = Router();

router.get("/settings", async (_req, res) => {
  let [row] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1));
  if (!row) {
    [row] = await db.insert(settingsTable).values({ id: 1 }).returning();
  }
  res.json(GetSettingsResponse.parse(row));
});

router.patch("/settings", async (req, res) => {
  const body = UpdateSettingsBody.parse(req.body);
  let [row] = await db
    .update(settingsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(settingsTable.id, 1))
    .returning();
  if (!row) {
    [row] = await db.insert(settingsTable).values({ id: 1, ...body }).returning();
  }
  const parsed = UpdateSettingsResponse.parse(row);
  // Apply any changed cron schedule immediately without restarting the server
  rescheduleFromSettings(parsed.dailyReminderEnabled, parsed.dailyReminderHour);
  res.json(parsed);
});

export default router;
