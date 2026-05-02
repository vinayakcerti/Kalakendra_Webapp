import { pgTable, serial, text, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const batchesTable = pgTable("batches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  programme: text("programme").notNull(),
  schedule: text("schedule").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  capacity: integer("capacity").notNull(),
  status: text("status").notNull().default("upcoming"),
  notes: text("notes"),
});

export const insertBatchSchema = createInsertSchema(batchesTable).omit({
  id: true,
});
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batchesTable.$inferSelect;
