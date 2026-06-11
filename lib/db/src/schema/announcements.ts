import { pgTable, uuid, varchar, text, boolean, date, timestamp } from "drizzle-orm/pg-core";

export const announcementsTable = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("info"),
  pinned: boolean("pinned").notNull().default(false),
  expiresAt: date("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
