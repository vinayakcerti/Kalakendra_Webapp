import {
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const consentFormsTable = pgTable("consent_forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  programName: text("program_name").notNull(),
  programYear: text("program_year").notNull().default(""),
  enrollmentDate: date("enrollment_date"),
  participantName: text("participant_name").notNull(),
  participantDob: date("participant_dob"),
  participantPhone: text("participant_phone"),
  participantEmail: text("participant_email"),
  guardianName: text("guardian_name"),
  emergencyContact: text("emergency_contact"),
  medicalConditions: text("medical_conditions"),
  isMinor: boolean("is_minor").notNull().default(false),
  consentItems: jsonb("consent_items").notNull().default([]),
  signatureName: text("signature_name").notNull(),
  guardianSignatureName: text("guardian_signature_name"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ConsentForm = typeof consentFormsTable.$inferSelect;
export type NewConsentForm = typeof consentFormsTable.$inferInsert;
