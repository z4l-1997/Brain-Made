import "server-only";

import { and, asc, count, desc, eq, gt, gte, inArray, lt, lte, like, type SQL } from "drizzle-orm";
import { ChatSDKError } from "../../errors";
import { tools, ToolStatus, type Tool, type NewTool } from "../schema/tools";
import { db } from "./";

// Lấy tất cả tools với pagination và filter
export async function getAllTools(options?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: ToolStatus;
  featured?: boolean;
  search?: string;
}): Promise<{ tools: Tool[]; total: number }> {
  try {
    const { page = 1, limit = 10, category, status = ToolStatus.ACTIVE, featured, search } = options || {};

    const offset = (page - 1) * limit;
    const conditions: SQL[] = [eq(tools.status, status)];

    if (category) {
      conditions.push(eq(tools.category, category));
    }

    if (featured !== undefined) {
      conditions.push(eq(tools.featured, featured));
    }

    if (search) {
      conditions.push(like(tools.title, `%${search}%`));
    }

    const whereClause = and(...conditions);

    const [toolsResult, totalResult] = await Promise.all([
      db.select().from(tools).where(whereClause).orderBy(desc(tools.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(tools).where(whereClause),
    ]);

    return {
      tools: toolsResult,
      total: totalResult[0].count,
    };
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get tools");
  }
}

// Lấy tool theo ID
export async function getToolById(id: string): Promise<Tool | null> {
  try {
    const result = await db.select().from(tools).where(eq(tools.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get tool by ID");
  }
}

// Tạo tool mới
export async function createTool(data: NewTool): Promise<Tool> {
  try {
    const [newTool] = await db.insert(tools).values(data).returning();
    return newTool;
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create tool");
  }
}

// Cập nhật tool
export async function updateTool(id: string, updates: Partial<NewTool>): Promise<Tool | null> {
  try {
    const [updatedTool] = await db
      .update(tools)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tools.id, id))
      .returning();
    return updatedTool || null;
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update tool");
  }
}

// Xóa tool
export async function deleteTool(id: string): Promise<boolean> {
  try {
    const result = await db.delete(tools).where(eq(tools.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete tool");
  }
}

// Lấy tools theo category
export async function getToolsByCategory(category: string, limit = 10): Promise<Tool[]> {
  try {
    return await db
      .select()
      .from(tools)
      .where(and(eq(tools.category, category), eq(tools.status, ToolStatus.ACTIVE)))
      .orderBy(desc(tools.rating), desc(tools.createdAt))
      .limit(limit);
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get tools by category");
  }
}

// Lấy featured tools
export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
  try {
    return await db
      .select()
      .from(tools)
      .where(and(eq(tools.featured, true), eq(tools.status, ToolStatus.ACTIVE)))
      .orderBy(desc(tools.rating), desc(tools.createdAt))
      .limit(limit);
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get featured tools");
  }
}

// Lấy top rated tools
export async function getTopRatedTools(limit = 10): Promise<Tool[]> {
  try {
    return await db
      .select()
      .from(tools)
      .where(and(eq(tools.status, ToolStatus.ACTIVE), gt(tools.rating, 0)))
      .orderBy(desc(tools.rating), desc(tools.createdAt))
      .limit(limit);
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get top rated tools");
  }
}

// Lấy tools mới nhất
export async function getLatestTools(limit = 10): Promise<Tool[]> {
  try {
    return await db.select().from(tools).where(eq(tools.status, ToolStatus.ACTIVE)).orderBy(desc(tools.createdAt)).limit(limit);
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get latest tools");
  }
}

// Tìm kiếm tools
export async function searchTools(query: string, limit = 20): Promise<Tool[]> {
  try {
    return await db
      .select()
      .from(tools)
      .where(and(eq(tools.status, ToolStatus.ACTIVE), like(tools.title, `%${query}%`)))
      .orderBy(desc(tools.rating), desc(tools.createdAt))
      .limit(limit);
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to search tools");
  }
}

// Lấy tools theo user
export async function getToolsByUser(userId: string, limit = 10): Promise<Tool[]> {
  try {
    return await db.select().from(tools).where(eq(tools.createdBy, userId)).orderBy(desc(tools.createdAt)).limit(limit);
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get tools by user");
  }
}

// Lấy thống kê tools
export async function getToolsStats(): Promise<{
  total: number;
  active: number;
  pending: number;
  inactive: number;
  featured: number;
}> {
  try {
    const [totalResult, activeResult, pendingResult, inactiveResult, featuredResult] = await Promise.all([
      db.select({ count: count() }).from(tools),
      db.select({ count: count() }).from(tools).where(eq(tools.status, ToolStatus.ACTIVE)),
      db.select({ count: count() }).from(tools).where(eq(tools.status, ToolStatus.PENDING)),
      db.select({ count: count() }).from(tools).where(eq(tools.status, ToolStatus.INACTIVE)),
      db
        .select({ count: count() })
        .from(tools)
        .where(and(eq(tools.featured, true), eq(tools.status, ToolStatus.ACTIVE))),
    ]);

    return {
      total: totalResult[0].count,
      active: activeResult[0].count,
      pending: pendingResult[0].count,
      inactive: inactiveResult[0].count,
      featured: featuredResult[0].count,
    };
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get tools stats");
  }
}
