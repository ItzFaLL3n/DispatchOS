"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";
import {
  createSessionToken,
  safeEqual,
  safeNextPath,
  SESSION_COOKIE,
} from "@/lib/session";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  };
}

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/"));

  if (!safeEqual(password, serverEnv.appPassword)) {
    return { error: "Wrong password." };
  }

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    createSessionToken(serverEnv.appSessionSecret),
    sessionCookieOptions(),
  );

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
