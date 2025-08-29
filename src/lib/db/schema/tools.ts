import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, varchar, uuid, text, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Enum quản lý trạng thái tool
export enum ToolStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
}

// Import user table for foreign key reference
import { user } from "./user";

export const tools = pgTable("Tools", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  descriptionVi: text("description_vi"),
  url: varchar("url", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  featured: boolean("featured").notNull().default(false),
  rating: real("rating").notNull().default(0),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: uuid("created_by").references(() => user.id),
  status: varchar("status", { length: 20 }).notNull().default(ToolStatus.ACTIVE), // Sử dụng enum ToolStatus
});

export type Tool = InferSelectModel<typeof tools>;
export type NewTool = InferInsertModel<typeof tools>;
