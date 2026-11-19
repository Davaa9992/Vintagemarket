"use client";
import Link from "next/link";
import { addToCart, useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { useLang } from "./lang-provider";

export function AddToCart({ product }: { product: Product }) {
  const { t } = useLang();
  const inCart = useCart().some((i) => i.id === product.id);
  if (product.status === "sold" || product.status === "reserved") {
    return (
      <button type="button" disabled className="btn-primary flex-1">
        {product.status === "sold" ? t.sold : t.reserved}
      </button>
    );
  }
  if (inCart) {
    return (
      <Link href="/cart" className="btn-primary min-h-[52px] flex-1">
        {t.inCart}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => addToCart(product)} className="btn-primary min-h-[52px] flex-1">
      {t.addToCart}
    </button>
  );
}
