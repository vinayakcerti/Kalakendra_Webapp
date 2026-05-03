import { and, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { feesTable, studentsTable, reminderJobRunsTable } from "@workspace/db/schema";
import { sendFeeReminder } from "./email";
import { logger } from "./logger";

async function logRun(
  triggeredBy: "scheduled" | "manual_mark_overdue" | "manual_remind_all",
  markedCount: number,
  remindedCount: number,
  failedCount: number
) {
  try {
    await db.insert(reminderJobRunsTable).values({
      triggeredBy,
      markedCount,
      remindedCount,
      failedCount,
    });
  } catch (err) {
    logger.error({ err }, "feeReminderService: failed to log job run");
  }
}

function getPortalUrl(): string {
  const domain = (process.env["REPLIT_DOMAINS"] ?? "").split(",")[0]?.trim();
  return domain ? `https://${domain}/portal/login` : "";
}

/**
 * Mark all pending fees past their due date as overdue, then send reminder
 * emails to every newly-overdue student who has an email address.
 * Returns counts for logging/response use.
 */
export async function markOverdueAndRemind(): Promise<{
  marked: number;
  reminded: number;
  failed: number;
}> {
  const today = new Date().toISOString().slice(0, 10);

  const toMark = await db
    .select({
      id: feesTable.id,
      description: feesTable.description,
      amountOre: feesTable.amountOre,
      dueDate: feesTable.dueDate,
      studentName: studentsTable.fullName,
      studentEmail: studentsTable.primaryContactEmail,
    })
    .from(feesTable)
    .innerJoin(studentsTable, eq(feesTable.studentId, studentsTable.id))
    .where(
      and(
        eq(feesTable.status, "pending"),
        sql`due_date IS NOT NULL AND due_date < ${today}::date`
      )
    );

  if (toMark.length === 0) {
    await logRun("scheduled", 0, 0, 0);
    return { marked: 0, reminded: 0, failed: 0 };
  }

  const ids = toMark.map((f) => f.id);
  await db.execute(
    sql`UPDATE fees SET status = 'overdue', updated_at = NOW()
        WHERE id = ANY(${ids}::uuid[])`
  );

  const portalUrl = getPortalUrl();
  let reminded = 0;
  let failed = 0;

  await Promise.allSettled(
    toMark
      .filter((f) => f.studentEmail)
      .map(async (f) => {
        try {
          await sendFeeReminder({
            to: f.studentEmail!,
            studentName: f.studentName,
            feeDescription: f.description,
            amountOre: f.amountOre,
            dueDate: f.dueDate ?? null,
            portalUrl,
          });
          await db
            .update(feesTable)
            .set({ reminderSentAt: new Date(), updatedAt: new Date() })
            .where(eq(feesTable.id, f.id));
          reminded++;
        } catch (err) {
          logger.error({ err, feeId: f.id }, "feeReminderService: failed to send reminder");
          failed++;
        }
      })
  );

  await logRun("scheduled", toMark.length, reminded, failed);
  return { marked: toMark.length, reminded, failed };
}

/**
 * Mark overdue and remind — triggered manually from the admin Fees page.
 */
export async function markOverdueAndRemindManual(): Promise<{
  marked: number;
  reminded: number;
  failed: number;
}> {
  const result = await markOverdueAndRemind();
  // Re-log this run as manual (overwrite the "scheduled" entry written inside)
  await logRun("manual_mark_overdue", result.marked, result.reminded, result.failed);
  return result;
}

/**
 * Send reminder emails to all students whose fees are currently overdue.
 * Does NOT re-mark anything — use markOverdueAndRemind for that.
 */
export async function remindAllCurrentlyOverdue(): Promise<{
  sent: number;
  skipped: number;
  failed: number;
}> {
  const overdueFees = await db
    .select({
      id: feesTable.id,
      description: feesTable.description,
      amountOre: feesTable.amountOre,
      dueDate: feesTable.dueDate,
      studentName: studentsTable.fullName,
      studentEmail: studentsTable.primaryContactEmail,
    })
    .from(feesTable)
    .innerJoin(studentsTable, eq(feesTable.studentId, studentsTable.id))
    .where(eq(feesTable.status, "overdue"));

  const withEmail = overdueFees.filter((f) => f.studentEmail);
  const portalUrl = getPortalUrl();
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    withEmail.map(async (f) => {
      try {
        await sendFeeReminder({
          to: f.studentEmail!,
          studentName: f.studentName,
          feeDescription: f.description,
          amountOre: f.amountOre,
          dueDate: f.dueDate ?? null,
          portalUrl,
        });
        await db
          .update(feesTable)
          .set({ reminderSentAt: new Date(), updatedAt: new Date() })
          .where(eq(feesTable.id, f.id));
        sent++;
      } catch (err) {
        logger.error({ err, feeId: f.id }, "feeReminderService: failed to send reminder");
        failed++;
      }
    })
  );

  await logRun("manual_remind_all", 0, sent, failed);
  return {
    sent,
    skipped: overdueFees.length - withEmail.length,
    failed,
  };
}
