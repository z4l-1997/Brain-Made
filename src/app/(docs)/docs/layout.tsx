import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./components/app-sidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

  return (
    <div>
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
