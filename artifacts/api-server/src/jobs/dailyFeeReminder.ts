import cron from "node-cron";
import { logger } from "../lib/logger";
import { markOverdueAndRemind } from "../lib/feeReminderService";

/**
 * Runs every day at 08:00 Europe/Stockholm time.
 * Marks all pending fees past their due date as overdue and emails students.
 */
export function startDailyFeeReminderJob(): void {
  cron.schedule(
    "0 8 * * *",
    async () => {
      logger.info("dailyFeeReminder: job started");
      try {
        const { marked, reminded, failed } = await markOverdueAndRemind();
        logger.info(
          { marked, reminded, failed },
          "dailyFeeReminder: job completed"
        );
      } catch (err) {
        logger.error({ err }, "dailyFeeReminder: unexpected error");
      }
    },
    {
      timezone: "Europe/Stockholm",
    }
  );

  logger.info(
    "dailyFeeReminder: scheduled for 08:00 Europe/Stockholm every day"
  );
}
