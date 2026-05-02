import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const studentNotesTable = pgTable("student_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorName: text("author_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
