import Link from "next/link";
import { formatMNT } from "@/lib/format";
import { CATEGORY_NAMES, GRADE_NAMES, type Dict, type Lang } from "@/lib/i18n";
import type { Product, Seller } from "@/lib/types";
import { FavButton } from "./fav-button";
import { ProductArt } from "./product-art";

export function ProductCard({
  p,
  lang,
  t,
  seller,
  showCategory = true,
}: {
  p: Product;
  lang: Lang;
  t: Dict;
  seller?: Seller;
  showCategory?: boolean;
}) {
  const sold = p.status === "sold";
  return (
    <article className="flex min-w-0 flex-col gap-3.5">
      <div className="relative">
        <Link href={`/products/${p.slug}`} aria-label={p.name} className="block">
          <ProductArt src={p.images[0]} tone={p.tone} className={sold ? "opacity-60" : undefined} />
          <span
            className={
              sold
                ? "absolute top-3 left-3 bg-ink px-2 py-1 text-[11px] font-bold tracking-wider text-cream uppercase"
                : "absolute top-3 left-3 bg-cream px-2 py-1 text-[11px] font-bold tracking-wide"
            }
          >
            {sold ? t.sold : `${p.grade} · ${GRADE_NAMES[lang][p.grade].short}`}
          </span>
        </Link>
        {!sold && <FavButton id={p.id} label={t.save} className="absolute top-1 right-1" />}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-widest text-muted uppercase">
          {p.era}
          {showCategory && ` · ${CATEGORY_NAMES[lang][p.category]}`}
        </span>
        <Link href={`/products/${p.slug}`} className="font-serif text-[21px] leading-tight font-medium hover:text-olive">
          {p.name}
        </Link>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-bold">{formatMNT(p.price)}</span>
          {seller && <span className="truncate text-xs text-muted">{seller.name}</span>}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ children, min = 230 }: { children: React.ReactNode; min?: number }) {
  return (
    <div className="grid gap-x-4 gap-y-10 sm:gap-x-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 44%), 1fr))` }}>
      {children}
    </div>
  );
}
