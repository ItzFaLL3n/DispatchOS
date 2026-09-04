"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MenuIcon } from "@/components/icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="main">{children}</main>
    </div>
  );
}
