"use client";
import Link from "next/link";
import { useState } from "react";
import type { CategorySlug, Product, Seller } from "@/lib/types";
import { CATEGORY_NAMES } from "@/lib/i18n";
import { useLang } from "./lang-provider";
import { ProductCard, ProductGrid } from "./product-card";

const TABS: ("all" | CategorySlug)[] = ["all", "clothing", "home", "antiques", "electronics"];

export function NewInTabs({ products, sellers }: { products: Product[]; sellers: Seller[] }) {
  const { lang, t } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const list = products.filter((p) => tab === "all" || p.category === tab).slice(0, 8);
  const sellerOf = (slug: string) => sellers.find((s) => s.slug === slug);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-4">
          <h2 className="font-serif text-[40px] font-medium">{t.newIn}</h2>
          <div role="group" aria-label={t.filters} className="flex flex-wrap gap-2">
            {TABS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={tab === id}
                onClick={() => setTab(id)}
                className={`min-h-10 cursor-pointer rounded-full border border-ink px-4 text-[13px] font-semibold ${
                  tab === id ? "bg-ink text-cream" : "bg-transparent text-ink hover:bg-paper"
                }`}
              >
                {id === "all" ? t.all : CATEGORY_NAMES[lang][id]}
              </button>
            ))}
          </div>
        </div>
        <Link href={tab === "all" ? "/products" : `/products?category=${tab}`} className="link-caps">
          {t.seeAll}
        </Link>
      </div>
      <ProductGrid min={240}>
        {list.map((p) => (
          <ProductCard key={p.id} p={p} lang={lang} t={t} seller={sellerOf(p.seller)} />
        ))}
      </ProductGrid>
    </>
  );
}
