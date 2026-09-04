"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/lib/nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar${open ? " open" : ""}`} id="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark">D</div>
        <div>
          <div className="brand-name">Dispatch</div>
          <div className="brand-sub">conversion console</div>
        </div>
      </div>

      <nav className="nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${isActive(pathname, item.href) ? " active" : ""}`}
                  onClick={onNavigate}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  {item.num ? <span className="nav-num">{item.num}</span> : null}
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        2 spots · honest terms
        <br />
        no bait-and-switch
      </div>
    </aside>
  );
}
