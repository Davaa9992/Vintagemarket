import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSeller, hasBackend } from "./api";
import { DEMO_SELLER, getSession, getToken } from "./session";
import type { Seller, SessionUser } from "./types";

export type SellerContext =
  | { mode: "demo"; seller?: Seller }
  | { mode: "live"; token: string; user: SessionUser; seller?: Seller; slug?: string };

/** Самбарын хуудас бүрт: backend байхгүй бол жишээ, байвал нэвтэрсэн худалдагч (нэг хүсэлтэд нэг удаа) */
export const getSellerContext = cache(async (): Promise<SellerContext> => {
  if (!hasBackend) return { mode: "demo", seller: await getSeller(DEMO_SELLER) };
  const [user, token] = await Promise.all([getSession(), getToken()]);
  if (!user || !token) redirect("/login?next=/seller");
  const slug = user.shop?.slug;
  return { mode: "live", token, user, slug, seller: slug ? await getSeller(slug) : undefined };
});
