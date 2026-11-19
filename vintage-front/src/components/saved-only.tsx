"use client";
import { useFavorites } from "@/lib/cart";
import { ProductGrid } from "./product-card";

/** Зөвхөн хадгалсан барааг харуулах (хадгалсан жагсаалт localStorage-д) */
export function SavedOnly({ cards, empty }: { cards: { id: string; node: React.ReactNode }[]; empty: React.ReactNode }) {
  const favs = useFavorites();
  const shown = cards.filter((c) => favs.includes(c.id));
  if (!shown.length) return <>{empty}</>;
  return <ProductGrid>{shown.map((c) => c.node)}</ProductGrid>;
}
