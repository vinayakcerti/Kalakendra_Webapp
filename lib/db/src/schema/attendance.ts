import {
  pgTable,
  uuid,
  date,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { studentsTable } from "./students";
import { batchesTable } from "./batches";

export const attendanceTable = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batchesTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("present"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.studentId, t.batchId, t.date)]
);

export type Attendance = typeof attendanceTable.$inferSelect;
