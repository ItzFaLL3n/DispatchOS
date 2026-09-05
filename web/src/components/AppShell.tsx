"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MenuIcon } from "@/components/icons";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

/** `/clients/<uuid>` → the id; any other path (including `/clients/new`,
 *  or bare `/clients`) → no client scope. */
function clientIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/clients\/([^/]+)$/);
  if (!match || match[1] === "new") return null;
  return match[1];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const pathname = usePathname();
  const clientId = clientIdFromPathname(pathname);

  return (
    <div className="app">
      <button
        className="mobile-menu-btn"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <MenuIcon />
      </button>
      <Sidebar
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
        onOpenAssistant={() => setAssistantOpen((v) => !v)}
      />
      <main className="main">{children}</main>
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} clientId={clientId} />
    </div>
  );
}
