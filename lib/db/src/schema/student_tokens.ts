import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const studentTokensTable = pgTable("student_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 96 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type StudentToken = typeof studentTokensTable.$inferSelect;
