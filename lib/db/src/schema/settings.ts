import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  smallint,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  monthlyFeeSek: integer("monthly_fee_sek").notNull().default(400),
  schoolName: varchar("school_name", { length: 120 })
    .notNull()
    .default("Kala Kendra Sweden"),
  contactEmail: varchar("contact_email", { length: 160 }),
  contactPhone: varchar("contact_phone", { length: 40 }),
  addressLine: varchar("address_line", { length: 200 }),
  acceptingApplications: boolean("accepting_applications")
    .notNull()
    .default(true),
  dailyReminderEnabled: boolean("daily_reminder_enabled")
    .notNull()
    .default(true),
  dailyReminderHour: smallint("daily_reminder_hour")
    .notNull()
    .default(8),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({
  updatedAt: true,
});
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
