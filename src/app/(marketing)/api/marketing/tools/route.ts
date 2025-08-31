import { NextResponse } from "next/server";
import { createTool, getAllTools } from "@/features/marketing/toolkit/actions";
import { ToolStatus, type NewTool } from "@/lib/db/schema/tools";

// Validation helper
function validateToolData(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    errors.push("Invalid data format");
    return { isValid: false, errors };
  }

  const toolData = data as Record<string, unknown>;

  if (!toolData.title || typeof toolData.title !== "string" || !toolData.title.trim()) {
    errors.push("Title is required");
  }
  if (!toolData.description || typeof toolData.description !== "string" || !toolData.description.trim()) {
    errors.push("Description is required");
  }
  if (!toolData.url || typeof toolData.url !== "string" || !toolData.url.trim()) {
    errors.push("URL is required");
  }
  if (!toolData.category || typeof toolData.category !== "string" || !toolData.category.trim()) {
    errors.push("Category is required");
  }

  // Validate URL format
  if (toolData.url && typeof toolData.url === "string") {
    try {
      new URL(toolData.url);
    } catch {
      errors.push("Invalid URL format");
    }
  }

  // Validate status
  if (toolData.status && typeof toolData.status === "string" && !Object.values(ToolStatus).includes(toolData.status as ToolStatus)) {
    errors.push("Invalid status value");
  }

  return { isValid: errors.length === 0, errors };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : searchParams.get("featured") === "false" ? false : undefined;
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as ToolStatus) || ToolStatus.ACTIVE;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
    }

    const result = await getAllTools({
      page,
      limit,
      category,
      status,
      featured,
      search,
    });

    return NextResponse.json({
      success: true,
      data: result.tools,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tools:", error);
    return NextResponse.json({ error: "Failed to fetch tools. Please try again later." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input data
    const validation = validateToolData(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
    }

    const { title, description, descriptionVi, url, category, featured = false, image, createdBy, status = ToolStatus.ACTIVE } = body;

    const newTool: NewTool = {
      title: title.trim(),
      description: description.trim(),
      descriptionVi: descriptionVi?.trim() || null,
      url: url.trim(),
      category: category.trim(),
      featured: Boolean(featured),
      image: image?.trim() || null,
      createdBy,
      status,
    };

    const createdTool = await createTool(newTool);

    return NextResponse.json(
      {
        success: true,
        message: "Tool created successfully",
        data: createdTool,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tool:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return NextResponse.json({ error: "Tool with this URL already exists" }, { status: 409 });
      }
      if (error.message.includes("foreign key")) {
        return NextResponse.json({ error: "Invalid user reference" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Failed to create tool. Please try again later." }, { status: 500 });
  }
}
