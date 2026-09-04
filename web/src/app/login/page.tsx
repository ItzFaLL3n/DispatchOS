import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";
import { SESSION_COOKIE, safeNextPath, verifySessionToken } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const store = await cookies();
  if (verifySessionToken(store.get(SESSION_COOKIE)?.value, serverEnv.appSessionSecret)) {
    redirect("/");
  }

  const { next } = await searchParams;
  return <LoginForm next={safeNextPath(next)} />;
}
