import { Suspense } from "react";
import { StaticMenuBar, ClientMenuBar } from "@/components/menu_bar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col gap-4 p-4">
      <header className="flex justify-center">
        <Suspense fallback={<StaticMenuBar />}>
          <ClientMenuBar />
        </Suspense>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
