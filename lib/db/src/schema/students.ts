import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  programme: text("programme").notNull(),
  batchId: integer("batch_id"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({
  id: true,
  joinedAt: true,
});
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
