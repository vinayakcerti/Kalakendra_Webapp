import cron, { type ScheduledTask } from "node-cron";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { markOverdueAndRemind } from "../lib/feeReminderService";

let activeTask: ScheduledTask | null = null;
let scheduledHour = 8;
let reminderEnabled = true;

async function runJob() {
  logger.info({ hour: scheduledHour }, "dailyFeeReminder: job started");
  try {
    const { marked, reminded, failed } = await markOverdueAndRemind();
    logger.info({ marked, reminded, failed }, "dailyFeeReminder: job completed");
  } catch (err) {
    logger.error({ err }, "dailyFeeReminder: unexpected error");
  }
}

function applySchedule(enabled: boolean, hour: number) {
  if (activeTask) {
    activeTask.stop();
    activeTask = null;
  }
  reminderEnabled = enabled;
  scheduledHour = hour;

  if (!enabled) {
    logger.info("dailyFeeReminder: disabled — no job scheduled");
    return;
  }

  const cronExpr = `0 ${hour} * * *`;
  activeTask = cron.schedule(cronExpr, runJob, { timezone: "Europe/Stockholm" });
  logger.info(
    { cronExpr, hour, timezone: "Europe/Stockholm" },
    "dailyFeeReminder: scheduled"
  );
}

/**
 * Call once at server startup. Reads settings from the DB to configure the job.
 */
export async function startDailyFeeReminderJob(): Promise<void> {
  try {
    const [row] = await db
      .select({
        dailyReminderEnabled: settingsTable.dailyReminderEnabled,
        dailyReminderHour: settingsTable.dailyReminderHour,
      })
      .from(settingsTable)
      .where(eq(settingsTable.id, 1));

    const enabled = row?.dailyReminderEnabled ?? true;
    const hour = row?.dailyReminderHour ?? 8;
    applySchedule(enabled, hour);
  } catch (err) {
    logger.error({ err }, "dailyFeeReminder: failed to read settings, defaulting to 08:00 enabled");
    applySchedule(true, 8);
  }
}

/**
 * Call after settings are saved to apply the new schedule without restarting the server.
 */
export function rescheduleFromSettings(enabled: boolean, hour: number): void {
  applySchedule(enabled, hour);
}

export { scheduledHour, reminderEnabled };
