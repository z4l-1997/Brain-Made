import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, varchar, uuid, text, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Enum quản lý trạng thái tool
export enum ToolStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
}

// Enum quản lý danh mục công cụ
export enum ToolCategory {
  DEVELOPER_TOOLS = "developer-tools", // Công cụ lập trình
  DESIGN_TOOLS = "design-tools", // Công cụ thiết kế
  IMAGE_MEDIA_TOOLS = "image-media-tools", // Công cụ hình ảnh & media
  SEO_ANALYTICS_TOOLS = "seo-analytics-tools", // Công cụ SEO & phân tích
  PRODUCTIVITY_UTILITIES = "productivity-utilities", // Tiện ích & năng suất
  LEARNING_REFERENCE = "learning-reference", // Học tập & tham khảo
}

// Import user table for foreign key reference
import { user } from "./user";

export const tools = pgTable("Tools", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  descriptionVi: text("description_vi"),
  url: varchar("url", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull().$type<ToolCategory>(),
  featured: boolean("featured").notNull().default(false),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: uuid("created_by").references(() => user.id),
  status: varchar("status", { length: 20 }).notNull().default(ToolStatus.ACTIVE), // Sử dụng enum ToolStatus
});

export type Tool = InferSelectModel<typeof tools>;
export type NewTool = InferInsertModel<typeof tools>;
