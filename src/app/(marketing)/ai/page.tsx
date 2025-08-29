import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Assistant - Brain Made",
  description: "Explore powerful AI assistants to enhance your development workflow and productivity.",
};

export default function AIPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Assistant</h1>
      <p className="text-muted-foreground">Explore powerful AI assistants to enhance your development workflow and productivity.</p>
    </div>
  );
}
