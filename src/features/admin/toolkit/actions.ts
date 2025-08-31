"use server";

import { revalidatePath } from "next/cache";
import { createTool, updateTool, deleteTool } from "./_db/queries";
import type { Tool, NewTool } from "@/lib/db/schema/tools";
import { ToolCategory, ToolStatus } from "@/lib/db/schema/tools";
import { auth } from "@/app/(auth)/auth";

// Helper function for input validation
function validateToolData(data: Record<string, unknown>, isPartial = false) {
  const errors: string[] = [];

  // Required field validation (only for complete data)
  if (!isPartial) {
    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
      errors.push("Tên tool không được để trống");
    }
    if (!data.description || typeof data.description !== "string" || !data.description.trim()) {
      errors.push("Mô tả không được để trống");
    }
    if (!data.url || typeof data.url !== "string" || !data.url.trim()) {
      errors.push("URL không được để trống");
    }
    if (!data.category || typeof data.category !== "string" || !data.category.trim()) {
      errors.push("Danh mục không được để trống");
    }
  } else {
    // Partial validation for updates
    if (data.title !== undefined && (typeof data.title !== "string" || !data.title.trim())) {
      errors.push("Tên tool không được để trống");
    }
    if (data.description !== undefined && (typeof data.description !== "string" || !data.description.trim())) {
      errors.push("Mô tả không được để trống");
    }
    if (data.url !== undefined && (typeof data.url !== "string" || !data.url.trim())) {
      errors.push("URL không được để trống");
    }
    if (data.category !== undefined && (typeof data.category !== "string" || !data.category.trim())) {
      errors.push("Danh mục không được để trống");
    }
  }

  // URL format validation
  if (data.url && typeof data.url === "string") {
    try {
      new URL(data.url);
    } catch {
      errors.push("URL không hợp lệ");
    }
  }

  // Category validation
  if (data.category && typeof data.category === "string" && !Object.values(ToolCategory).includes(data.category as ToolCategory)) {
    errors.push("Danh mục không hợp lệ");
  }

  // Status validation
  if (data.status && typeof data.status === "string" && !Object.values(ToolStatus).includes(data.status as ToolStatus)) {
    errors.push("Trạng thái không hợp lệ");
  }

  return errors;
}

// Create new tool action
export async function createToolAction(data: Omit<NewTool, "id" | "createdAt" | "updatedAt" | "createdBy">) {
  try {
    // Get current user session
    const session = await auth();
    const createdBy = session?.user?.id;

    // Validate input data
    const validationErrors = validateToolData(data, false);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(", "),
      };
    }

    // Create the tool
    const newTool = await createTool(data, createdBy);

    // Revalidate the relevant pages
    revalidatePath("/dashboard/toolkit");
    revalidatePath("/admin/dashboard/toolkit");

    return { success: true, tool: newTool };
  } catch (error) {
    console.error("Error creating tool:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định khi tạo tool",
    };
  }
}

// Update tool action
export async function updateToolAction(id: string, data: Partial<Omit<NewTool, "id" | "createdAt" | "createdBy">>) {
  try {
    // Validate input data
    const validationErrors = validateToolData(data, true);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(", "),
      };
    }

    // Additional validation for ID
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "ID tool không hợp lệ",
      };
    }

    // Update the tool
    const updatedTool = await updateTool(id, data);

    // Revalidate the relevant pages
    revalidatePath("/dashboard/toolkit");
    revalidatePath("/admin/dashboard/toolkit");

    return { success: true, tool: updatedTool };
  } catch (error) {
    console.error("Error updating tool:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định khi cập nhật tool",
    };
  }
}

// Delete tool action
export async function deleteToolAction(id: string) {
  try {
    await deleteTool(id);

    // Revalidate the page to show updated data
    revalidatePath("/dashboard/tools");

    return { success: true };
  } catch (error) {
    console.error("Error deleting tool:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
}

// Bulk actions
export async function bulkDeleteToolsAction(ids: string[]) {
  try {
    const results = await Promise.allSettled(ids.map((id) => deleteTool(id)));

    const failed = results.filter((result) => result.status === "rejected").length;
    const succeeded = results.length - failed;

    revalidatePath("/dashboard/tools");

    return {
      success: true,
      message: `Đã xóa ${succeeded} tools. ${failed > 0 ? `${failed} tools không thể xóa.` : ""}`,
    };
  } catch (error) {
    console.error("Error bulk deleting tools:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
}

export async function bulkUpdateStatusAction(ids: string[], status: string) {
  try {
    const results = await Promise.allSettled(ids.map((id) => updateTool(id, { status })));

    const failed = results.filter((result) => result.status === "rejected").length;
    const succeeded = results.length - failed;

    revalidatePath("/dashboard/tools");

    return {
      success: true,
      message: `Đã cập nhật ${succeeded} tools. ${failed > 0 ? `${failed} tools không thể cập nhật.` : ""}`,
    };
  } catch (error) {
    console.error("Error bulk updating tools:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
}
