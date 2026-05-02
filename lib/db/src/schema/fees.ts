import {
  pgTable,
  uuid,
  varchar,
  integer,
  date,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const feesTable = pgTable("fees", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 200 }).notNull(),
  amountOre: integer("amount_ore").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("SEK"),
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFeeSchema = createInsertSchema(feesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Fee = typeof feesTable.$inferSelect;
