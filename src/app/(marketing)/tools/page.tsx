import ToolsClientPage from "@/views/tools";
import { getAllTools } from "@/lib/db/queries/tools";
import { ToolStatus } from "@/lib/db/schema/tools";
import React from "react";

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
