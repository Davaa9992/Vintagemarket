import "server-only";
import { cookies } from "next/headers";
import { apiFetch, hasBackend } from "./api";
import type { SessionUser } from "./types";

/** Backend холбогдоогүй үед самбарт харагдах жишээ худалдагч */
export const DEMO_SELLER = "hadgalsan-tsag";

/** JWT-г httpOnly cookie-д хадгална (lib/actions.ts) */
export const TOKEN_COOKIE = "vm_token";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

interface BackendMe {
  _id: string;
  full_name: string;
  phone: string;
  role: SessionUser["role"];
  shop?: SessionUser["shop"] | null;
}

/** Нэвтэрсэн хэрэглэгч (token хүчингүй бол null) */
export async function getSession(): Promise<SessionUser | null> {
  if (!hasBackend) return null;
  const token = await getToken();
  if (!token) return null;
  try {
    const me = await apiFetch<BackendMe>("/user/info", { token });
    return { id: me._id, name: me.full_name, phone: me.phone, role: me.role, shop: me.shop ?? undefined };
  } catch {
    return null;
  }
}
