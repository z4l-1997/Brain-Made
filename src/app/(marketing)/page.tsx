import type { Metadata } from "next";

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

export default function MarketingPage() {
  return (
    <>
      <h1 className="sr-only">Brain Made - Developer Resources Platform</h1>
      <div>Hiêu</div>
    </>
  );
}
