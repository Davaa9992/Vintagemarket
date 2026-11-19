import type { Metadata } from "next";
import Link from "next/link";
import { ProductFilters, ActiveChips, SearchBox, SortSelect } from "@/components/product-filters";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { SavedOnly } from "@/components/saved-only";
import { getProducts, getSellers } from "@/lib/api";
import { CATEGORY_NAMES } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { CATEGORY_SLUGS, DECADES, type CategorySlug, type Decade, type Grade, type ProductQuery } from "@/lib/types";

export const metadata: Metadata = { title: "Бараа" };

type SP = Promise<Record<string, string | string[] | undefined>>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v.join(",") : v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const num = (v: string | string[] | undefined) => {
  const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
};

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const query: ProductQuery = {
    categories: list(sp.category).filter((c): c is CategorySlug => (CATEGORY_SLUGS as readonly string[]).includes(c)),
    grades: list(sp.grade).filter((g): g is Grade => ["A", "B", "C", "D"].includes(g)),
    decades: list(sp.era).filter((d): d is Decade => (DECADES as readonly string[]).includes(d)),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    q: typeof sp.q === "string" ? sp.q : undefined,
    sort: sp.sort === "low" || sp.sort === "high" ? sp.sort : "new",
  };
  const savedOnly = sp.saved === "1";
  const [products, all, sellers] = await Promise.all([getProducts(query), getProducts(), getSellers()]);
  const counts = Object.fromEntries(CATEGORY_SLUGS.map((c) => [c, all.filter((p) => p.category === c).length])) as Record<CategorySlug, number>;
  const sellerOf = (slug: string) => sellers.find((s) => s.slug === slug);
  const title =
    savedOnly ? t.favorites : query.categories?.length === 1 ? CATEGORY_NAMES[lang][query.categories[0]] : t.allProducts;

  const cards = products.map((p) => ({ id: p.id, node: <ProductCard key={p.id} p={p} lang={lang} t={t} seller={sellerOf(p.seller)} /> }));

  return (
    <div className="container-vm pt-8">
      <nav aria-label="breadcrumb" className="flex gap-2 text-[13px] text-muted">
        <Link href="/" className="text-muted">
          {t.home}
        </Link>
        <span>/</span>
        <span className="text-ink">{title}</span>
      </nav>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-4">
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] leading-none font-medium">{title}</h1>
          {!savedOnly && (
            <span className="text-sm text-muted">
              {products.length} {t.itemsCount}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox />
          <SortSelect />
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-x-12 gap-y-6">
        <ProductFilters counts={counts} />
        <section aria-label={t.items} className="min-w-0 flex-[999_1_560px]">
          <ActiveChips />
          {products.length === 0 ? (
            <EmptyState title={t.noResults} hint={t.noResultsHint} cta={t.clearFilters} />
          ) : savedOnly ? (
            <SavedOnly cards={cards} empty={<EmptyState title={t.noResults} hint="" cta={t.allProducts} />} />
          ) : (
            <ProductGrid>{cards.map((c) => c.node)}</ProductGrid>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ title, hint, cta }: { title: string; hint: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-3.5 bg-paper px-8 py-16 text-center">
      <h2 className="font-serif text-[32px] font-medium">{title}</h2>
      {hint && <p className="text-[15px] text-muted">{hint}</p>}
      <Link href="/products" className="btn-outline">
        {cta}
      </Link>
    </div>
  );
}
