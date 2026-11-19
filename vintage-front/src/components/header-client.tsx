"use client";
import Link from "next/link";
import { useCart, useFavorites } from "@/lib/cart";
import { BagIcon, HeartIcon } from "./icons";

const Badge = ({ n }: { n: number }) =>
  n > 0 ? (
    <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] font-bold text-[#f7f3ea]">
      {n}
    </span>
  ) : null;

export function CartLink({ label }: { label: string }) {
  const n = useCart().length;
  return (
    <Link href="/cart" aria-label={`${label}, ${n}`} className="relative inline-flex size-11 items-center justify-center text-ink">
      <BagIcon />
      <Badge n={n} />
    </Link>
  );
}

export function FavCount({ label }: { label: string }) {
  const n = useFavorites().length;
  return (
    <Link
      href="/products?saved=1"
      aria-label={`${label}, ${n}`}
      className="relative hidden size-11 items-center justify-center text-ink sm:inline-flex"
    >
      <HeartIcon />
      <Badge n={n} />
    </Link>
  );
}
