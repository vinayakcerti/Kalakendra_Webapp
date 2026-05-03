import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const reminderJobRunsTable = pgTable("reminder_job_runs", {
  id: serial("id").primaryKey(),
  triggeredBy: varchar("triggered_by", { length: 20 }).notNull().default("scheduled"),
  markedCount: integer("marked_count").notNull().default(0),
  remindedCount: integer("reminded_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReminderJobRun = typeof reminderJobRunsTable.$inferSelect;
