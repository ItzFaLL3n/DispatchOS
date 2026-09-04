import { AppShell } from "@/components/AppShell";

/**
 * Layout for every authenticated page. The Proxy (src/proxy.ts) is the auth
 * gate; this layout just provides the console chrome. The bare `/login` route
 * lives outside this group and renders without the rail.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
