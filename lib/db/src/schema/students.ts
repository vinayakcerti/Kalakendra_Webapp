import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { admissionsTable } from "./admissions";
import { batchesTable } from "./batches";

export const studentsTable = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  admissionId: uuid("admission_id").references(() => admissionsTable.id),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  dob: date("dob"),
  batchId: uuid("batch_id").references(() => batchesTable.id),
  primaryContactName: varchar("primary_contact_name", { length: 120 }),
  primaryContactEmail: varchar("primary_contact_email", { length: 160 }),
  primaryContactPhone: varchar("primary_contact_phone", { length: 40 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({
  id: true,
  enrolledAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
