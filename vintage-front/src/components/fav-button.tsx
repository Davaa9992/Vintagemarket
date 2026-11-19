"use client";
import { toggleFavorite, useFavorites } from "@/lib/cart";
import { cx } from "@/lib/format";
import { HeartIcon } from "./icons";

export function FavButton({ id, label, className, outlined }: { id: string; label: string; className?: string; outlined?: boolean }) {
  const on = useFavorites().includes(id);
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={() => toggleFavorite(id)}
      className={cx(
        "inline-flex cursor-pointer items-center justify-center",
        outlined ? "size-[52px] rounded-[2px] border border-ink hover:bg-paper" : "size-11",
        on ? "text-brick" : "text-ink",
        className,
      )}
    >
      <HeartIcon filled={on} size={outlined ? 22 : 20} />
    </button>
  );
}
