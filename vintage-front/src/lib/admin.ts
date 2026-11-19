import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { hasBackend } from "./api";
import { getSession, getToken } from "./session";
import type { SessionUser } from "./types";

/** Админ эрхтэй эсэхийг шалгана. Админ биш бол 404 (самбар байгааг ч мэдэгдэхгүй) */
export const getAdminContext = cache(async (): Promise<{ token: string; user: SessionUser } | null> => {
  if (!hasBackend) return null;
  const [user, token] = await Promise.all([getSession(), getToken()]);
  if (!user || !token) redirect("/login?next=/admin");
  if (user.role !== "admin") notFound();
  return { token, user };
});
