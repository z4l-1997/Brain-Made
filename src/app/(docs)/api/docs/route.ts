import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface DocFile {
  name: string;
  path: string;
  relativePath: string;
  content: string;
  frontmatter: Record<string, unknown>;
  category?: string;
  lastModified: string;
}

function getAllMarkdownFiles(dirPath: string, baseDir: string): DocFile[] {
  const files: DocFile[] = [];

  function scanDirectory(currentPath: string) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath);
      } else if (item.endsWith(".md")) {
        // Process markdown file
        const fileContent = fs.readFileSync(fullPath, "utf8");
        const { data: frontmatter, content } = matter(fileContent);

        // Get relative path from docs root
        const relativePath = path.relative(baseDir, fullPath);

        // Extract category from folder structure
        const pathParts = relativePath.split(path.sep);
        const category = pathParts.length > 1 ? pathParts[0] : "General";

        // Format file name
        const fileName = item.replace(".md", "");
        const formattedName = (frontmatter.title as string) || fileName.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

        files.push({
          name: formattedName,
          path: item,
          relativePath,
          content,
          frontmatter,
          category,
          lastModified: stat.mtime.toISOString(),
        });
      }
    }
  }

  scanDirectory(dirPath);
  return files;
}

export async function GET(request: NextRequest) {
  try {
    const docsPath = path.join(process.cwd(), "docs");

    // Check if docs directory exists
    if (!fs.existsSync(docsPath)) {
      return NextResponse.json({ error: "Docs directory not found" }, { status: 404 });
    }

    // Get all markdown files recursively
    const docs = getAllMarkdownFiles(docsPath, docsPath);

    if (docs.length === 0) {
      return NextResponse.json({ error: "No markdown files found" }, { status: 404 });
    }

    // Sort by category, then by name
    docs.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category!.localeCompare(b.category!);
      }
      return a.name.localeCompare(b.name);
    });

    // Group by category for better organization
    const groupedDocs = docs.reduce((acc, doc) => {
      const category = doc.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, DocFile[]>);

    return NextResponse.json({
      docs,
      groupedDocs,
      categories: Object.keys(groupedDocs),
      totalFiles: docs.length,
    });
  } catch (error) {
    console.error("Error reading docs:", error);
    return NextResponse.json({ error: "Failed to load documentation" }, { status: 500 });
  }
}
