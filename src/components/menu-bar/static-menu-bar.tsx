import { Wrench, Bot, Palette, Zap, Star, Globe } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { icon: Wrench, label: "Developer Tools", href: "/tools" },
  { icon: Bot, label: "AI Assistant", href: "/ai" },
  { icon: Palette, label: "CSS Framework", href: "/css" },
  { icon: Zap, label: "Code Snippets", href: "/snippets" },
  { icon: Star, label: "Trending Repos", href: "/trending" },
  { icon: Globe, label: "Open Source", href: "/opensource" },
];

export default function StaticMenuBar() {
  return (
    <nav className="w-max p-2 rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden">
      <ul className="flex items-center gap-2 relative z-10">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.label} className="relative">
              <Link
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 relative z-10 text-muted-foreground hover:text-foreground transition-colors rounded-xl"
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
