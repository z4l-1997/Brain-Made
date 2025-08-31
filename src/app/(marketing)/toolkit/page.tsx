import React from "react";
import { Metadata } from "next";

import { ToolStatus } from "@/lib/db/schema/tools";

import ToolsClientPage from "@/features/marketing/toolkit/_views/tools-client-page";
import { getAllTools } from "@/features/marketing/toolkit/actions";

export const metadata: Metadata = {
  title: "Brain Made - Developer Tools & Resources",
  description:
    "Discover the best developer tools, AI assistants, CSS frameworks, code snippets, trending repositories, and open source projects.",
  keywords: ["developer tools", "AI assistant", "CSS framework", "code snippets", "trending repos", "open source"],
  openGraph: {
    title: "Brain Made - Developer Tools & Resources",
    description:
      "Discover the best developer tools, AI assistants, CSS frameworks, code snippets, trending repositories, and open source projects.",
    type: "website",
  },
};

export default async function page() {
  // Fetch tools data on server side
  const toolsData = await getAllTools({
    page: 1,
    limit: 20,
    status: ToolStatus.ACTIVE,
  });

  return (
    <div>
      <ToolsClientPage initialData={toolsData} />
    </div>
  );
}
