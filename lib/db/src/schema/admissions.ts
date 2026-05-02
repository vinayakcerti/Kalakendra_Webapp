import {
  pgTable,
  uuid,
  varchar,
  date,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { adminsTable } from "./admins";

export const admissionsTable = pgTable("admissions", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantType: varchar("applicant_type", { length: 10 })
    .notNull()
    .default("adult"),

  studentName: varchar("student_name", { length: 120 }).notNull(),
  studentDob: date("student_dob").notNull(),
  studentGender: varchar("student_gender", { length: 20 }),

  studentEmail: varchar("student_email", { length: 160 }),
  studentPhone: varchar("student_phone", { length: 40 }),

  parentName: varchar("parent_name", { length: 120 }),
  parentRelationship: varchar("parent_relationship", { length: 20 }),
  parentEmail: varchar("parent_email", { length: 160 }),
  parentPhone: varchar("parent_phone", { length: 40 }),

  emergencyName: varchar("emergency_name", { length: 120 }),
  emergencyPhone: varchar("emergency_phone", { length: 40 }),

  addressStreet: varchar("address_street", { length: 200 }).notNull(),
  addressPostal: varchar("address_postal", { length: 20 }).notNull(),
  addressCity: varchar("address_city", { length: 80 }).notNull(),

  batch: varchar("batch", { length: 40 }).notNull(),
  experience: varchar("experience", { length: 20 }).notNull().default("none"),
  experienceDetails: text("experience_details"),
  joiningDate: date("joining_date"),

  medicalNotes: text("medical_notes"),
  willStagePerform: varchar("will_stage_perform", { length: 10 })
    .notNull()
    .default("maybe"),
  motivation: text("motivation"),
  referralSource: varchar("referral_source", { length: 40 }),
  photoConsent: varchar("photo_consent", { length: 20 })
    .notNull()
    .default("yes-internal"),
  rulesConsent: varchar("rules_consent", { length: 10 })
    .notNull()
    .default("agree"),
  suggestions: text("suggestions"),

  status: varchar("status", { length: 20 }).notNull().default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => adminsTable.id),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),

  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAdmissionSchema = createInsertSchema(admissionsTable).omit({
  id: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;
export type Admission = typeof admissionsTable.$inferSelect;
