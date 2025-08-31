"use server";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { tools, type Tool, type NewTool, ToolCategory, ToolStatus } from "@/lib/db/schema/tools";
import { eq, desc, ilike, and, or, count, sql } from "drizzle-orm";
import { db } from "@/lib/db/queries";

// Helper function to handle database errors
function handleDatabaseError(error: unknown, operation: string): never {
  console.error(`Database error during ${operation}:`, error);

  if (error instanceof Error) {
    // Check for common database errors
    if (error.message.includes("connection")) {
      throw new Error(`Database connection failed during ${operation}`);
    }
    if (error.message.includes("timeout")) {
      throw new Error(`Database timeout during ${operation}`);
    }
    if (error.message.includes("constraint")) {
      throw new Error(`Data validation failed during ${operation}`);
    }
  }

  throw new Error(`Failed to ${operation}`);
}

// Get all tools
export async function getAllTools(): Promise<Tool[]> {
  try {
    const result = await db.select().from(tools).orderBy(desc(tools.createdAt));

    return result;
  } catch (error) {
    handleDatabaseError(error, "fetch tools");
  }
}

// Get tool by ID
export async function getToolById(id: string): Promise<Tool | null> {
  try {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid tool ID provided");
    }

    const result = await db.select().from(tools).where(eq(tools.id, id)).limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, "fetch tool by ID");
  }
}

// Create new tool
export async function createTool(data: Omit<NewTool, "id" | "createdAt" | "updatedAt" | "createdBy">, createdBy?: string): Promise<Tool> {
  try {
    // Validate required fields
    if (!data.title || !data.description || !data.url || !data.category) {
      throw new Error("Missing required fields: title, description, url, category");
    }

    const [newTool] = await db
      .insert(tools)
      .values({
        ...data,
        createdBy: createdBy || null,
      })
      .returning();

    if (!newTool) {
      throw new Error("Failed to create tool - no data returned");
    }

    return newTool;
  } catch (error) {
    handleDatabaseError(error, "create tool");
  }
}

// Update tool
export async function updateTool(id: string, data: Partial<Omit<NewTool, "id" | "createdAt" | "createdBy">>): Promise<Tool> {
  try {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid tool ID provided");
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error("No update data provided");
    }

    const [updatedTool] = await db
      .update(tools)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tools.id, id))
      .returning();

    if (!updatedTool) {
      throw new Error("Tool not found or update failed");
    }

    return updatedTool;
  } catch (error) {
    handleDatabaseError(error, "update tool");
  }
}

// Delete tool
export async function deleteTool(id: string): Promise<void> {
  try {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid tool ID provided");
    }

    const result = await db.delete(tools).where(eq(tools.id, id)).returning();

    if (result.length === 0) {
      throw new Error("Tool not found or already deleted");
    }
  } catch (error) {
    handleDatabaseError(error, "delete tool");
  }
}

// Search tools by title or description
export async function searchTools(searchTerm: string): Promise<Tool[]> {
  try {
    const result = await db
      .select()
      .from(tools)
      .where(or(ilike(tools.title, `%${searchTerm}%`), ilike(tools.description, `%${searchTerm}%`)))
      .orderBy(desc(tools.createdAt));

    return result;
  } catch (error) {
    console.error("Error searching tools:", error);
    throw new Error("Failed to search tools");
  }
}

// Get tools by category
export async function getToolsByCategory(category: ToolCategory): Promise<Tool[]> {
  try {
    const result = await db.select().from(tools).where(eq(tools.category, category)).orderBy(desc(tools.createdAt));

    return result;
  } catch (error) {
    console.error("Error fetching tools by category:", error);
    throw new Error("Failed to fetch tools by category");
  }
}

// Get featured tools
export async function getFeaturedTools(): Promise<Tool[]> {
  try {
    const result = await db.select().from(tools).where(eq(tools.featured, true)).orderBy(desc(tools.createdAt));

    return result;
  } catch (error) {
    console.error("Error fetching featured tools:", error);
    throw new Error("Failed to fetch featured tools");
  }
}

// Get tools stats - Optimized version
export async function getToolsStats() {
  try {
    // Use SQL aggregation for better performance instead of fetching all records
    const [totalResult, activeResult, inactiveResult, pendingResult, featuredResult, categoriesResult] = await Promise.all([
      db.select({ count: count() }).from(tools),
      db.select({ count: count() }).from(tools).where(eq(tools.status, ToolStatus.ACTIVE)),
      db.select({ count: count() }).from(tools).where(eq(tools.status, ToolStatus.INACTIVE)),
      db.select({ count: count() }).from(tools).where(eq(tools.status, ToolStatus.PENDING)),
      db.select({ count: count() }).from(tools).where(eq(tools.featured, true)),
      db.select({ category: tools.category }).from(tools).groupBy(tools.category),
    ]);

    const stats = {
      total: totalResult[0]?.count || 0,
      active: activeResult[0]?.count || 0,
      inactive: inactiveResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0,
      featured: featuredResult[0]?.count || 0,
      categories: categoriesResult.length,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching tools stats:", error);
    throw new Error("Failed to fetch tools stats");
  }
}

// Get tools with pagination
export async function getToolsPaginated(
  page: number = 1,
  limit: number = 10,
  category?: ToolCategory,
  status?: ToolStatus,
  searchTerm?: string
): Promise<{ tools: Tool[]; total: number; totalPages: number }> {
  try {
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (category) {
      conditions.push(eq(tools.category, category));
    }

    if (status) {
      conditions.push(eq(tools.status, status));
    }

    if (searchTerm) {
      conditions.push(or(ilike(tools.title, `%${searchTerm}%`), ilike(tools.description, `%${searchTerm}%`)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count and tools in parallel
    const [toolsResult, totalResult] = await Promise.all([
      db.select().from(tools).where(whereClause).orderBy(desc(tools.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(tools).where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      tools: toolsResult,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated tools:", error);
    throw new Error("Failed to fetch paginated tools");
  }
}

// Get tools by multiple categories
export async function getToolsByCategories(categories: ToolCategory[]): Promise<Tool[]> {
  try {
    if (categories.length === 0) {
      return [];
    }

    const conditions = categories.map((category) => eq(tools.category, category));
    const result = await db
      .select()
      .from(tools)
      .where(or(...conditions))
      .orderBy(desc(tools.createdAt));

    return result;
  } catch (error) {
    console.error("Error fetching tools by categories:", error);
    throw new Error("Failed to fetch tools by categories");
  }
}

// Get tools by status
export async function getToolsByStatus(status: ToolStatus): Promise<Tool[]> {
  try {
    const result = await db.select().from(tools).where(eq(tools.status, status)).orderBy(desc(tools.createdAt));

    return result;
  } catch (error) {
    console.error("Error fetching tools by status:", error);
    throw new Error("Failed to fetch tools by status");
  }
}

// Get recent tools (last N tools)
export async function getRecentTools(limit: number = 5): Promise<Tool[]> {
  try {
    const result = await db.select().from(tools).where(eq(tools.status, ToolStatus.ACTIVE)).orderBy(desc(tools.createdAt)).limit(limit);

    return result;
  } catch (error) {
    console.error("Error fetching recent tools:", error);
    throw new Error("Failed to fetch recent tools");
  }
}
