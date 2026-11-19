import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { Avatar } from "@/components/avatar";
import { FavButton } from "@/components/fav-button";
import { Gallery } from "@/components/gallery";
import { CardIcon, TruckIcon } from "@/components/icons";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { getProduct, getProducts, getSeller } from "@/lib/api";
import { formatMNT } from "@/lib/format";
import { CATEGORY_NAMES, GRADE_NAMES } from "@/lib/i18n";
import { getDict } from "@/lib/lang";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return { title: p?.name ?? "Бараа", description: p?.description };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { lang, t } = await getDict();
  const p = await getProduct(slug);
  if (!p) notFound();
  const [seller, more] = await Promise.all([getSeller(p.seller), getProducts({ seller: p.seller })]);
  const others = more.filter((x) => x.id !== p.id).slice(0, 4);
  const G = GRADE_NAMES[lang];
  const facts = [
    [t.size, p.size],
    [t.material, p.material],
    [t.color, p.color],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <div className="container-vm pt-7">
      <nav aria-label="breadcrumb" className="flex flex-wrap gap-2 text-[13px] text-muted">
        <Link href="/" className="text-muted">
          {t.home}
        </Link>
        <span>/</span>
        <Link href={`/products?category=${p.category}`} className="text-muted">
          {CATEGORY_NAMES[lang][p.category]}
        </Link>
        <span>/</span>
        <span className="text-ink">{p.name.split(",")[0]}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-start gap-14">
        <section aria-label={t.photos} className="min-w-0 flex-[7_1_480px]">
          <Gallery images={p.images} tone={p.tone} name={p.name} />
        </section>

        <section className="flex min-w-0 flex-[5_1_360px] flex-col gap-5.5">
          <div className="flex flex-col gap-2.5">
            <span className="eyebrow text-olive">
              {p.era} · {CATEGORY_NAMES[lang][p.category]}
            </span>
            <h1 className="font-serif text-[clamp(36px,4vw,50px)] leading-[1.05] font-medium">{p.name}</h1>
            <div className="flex flex-wrap items-baseline gap-3.5">
              <span className="text-[28px] font-bold">{formatMNT(p.price)}</span>
              <span className="text-[13px] text-muted">{t.oneOfAKind}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 bg-paper p-5">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm">{t.condition}</strong>
              <Link href="/help#grades" className="text-[13px] text-olive underline">
                {t.whatIsGrade}
              </Link>
            </div>
            <div role="img" aria-label={`${t.condition}: ${p.grade}, ${G[p.grade].long}`} className="grid grid-cols-4 gap-1.5">
              {(["A", "B", "C", "D"] as const).map((g) => (
                <span
                  key={g}
                  className={`flex flex-col gap-0.5 px-2 py-2.5 text-[13px] font-bold ${g === p.grade ? "bg-olive text-[#f7f3ea]" : "bg-cream text-faint"}`}
                >
                  <span>{g}</span>
                  <span className="text-xs font-medium">{G[g].short}</span>
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-ink-2">{p.gradeNote ?? G[p.grade].desc}</p>
          </div>

          {facts.length > 0 && (
            <div className="grid gap-px border border-line bg-line" style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}>
              {facts.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 bg-cream p-3.5">
                  <span className="text-xs text-muted">{k}</span>
                  <strong className="text-[15px]">{v}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2.5">
            <AddToCart product={p} />
            <FavButton id={p.id} label={t.save} outlined />
          </div>

          <div className="flex flex-col gap-2 text-sm text-ink-2">
            <span className="flex items-center gap-2.5">
              <TruckIcon size={18} className="text-olive" />
              {t.deliveryNote}
            </span>
            <span className="flex items-center gap-2.5">
              <CardIcon size={18} className="text-olive" />
              {t.paymentNote}
            </span>
          </div>

          {seller && (
            <div className="flex items-center gap-3.5 border-t border-line py-4.5">
              <Avatar initials={seller.initials} size={56} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-xs text-muted">{t.seller}</span>
                <Link href={`/shops/${seller.slug}`} className="font-serif text-2xl leading-tight font-semibold">
                  {seller.name}
                </Link>
                <span className="text-[13px] text-muted">{[seller.city, seller.district].filter(Boolean).join(", ")}</span>
              </div>
              <Link href={`/shops/${seller.slug}`} className="link-caps">
                {t.shop}
              </Link>
            </div>
          )}

          <div className="[&_details]:border-t [&_details]:border-line [&_summary]:flex [&_summary]:min-h-14 [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:items-center [&_summary]:justify-between [&_summary]:text-[15px] [&_summary]:font-bold">
            <details open className="group">
              <summary>
                {t.description}
                <span aria-hidden className="text-xl font-normal group-open:hidden">+</span><span aria-hidden className="hidden text-xl font-normal group-open:inline">–</span>
              </summary>
              <p className="mb-5 text-[15px] leading-[1.7] text-ink-2">{p.description}</p>
            </details>
            {p.measurements.length > 0 && (
              <details open className="group">
                <summary>
                  {t.measurements}
                  <span aria-hidden className="text-xl font-normal group-open:hidden">+</span><span aria-hidden className="hidden text-xl font-normal group-open:inline">–</span>
                </summary>
                <table className="mb-5 w-full border-collapse text-sm">
                  <tbody>
                    {p.measurements.map((m) => (
                      <tr key={m.label} className="border-b border-line-soft">
                        <th scope="row" className="py-2.5 text-left font-medium text-muted">
                          {m.label}
                        </th>
                        <td className="py-2.5 text-right font-bold">{m.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
            <details className="group">
              <summary>
                {t.shippingReturns}
                <span aria-hidden className="text-xl font-normal group-open:hidden">+</span><span aria-hidden className="hidden text-xl font-normal group-open:inline">–</span>
              </summary>
              <p className="mb-5 text-[15px] leading-[1.7] text-ink-2">{t.shippingReturnsText}</p>
            </details>
            <details className="group">
              <summary>
                {t.askSeller}
                <span aria-hidden className="text-xl font-normal group-open:hidden">+</span><span aria-hidden className="hidden text-xl font-normal group-open:inline">–</span>
              </summary>
              <form className="mb-5 flex flex-col gap-2.5">
                <label htmlFor="q" className="text-[13px] text-muted">
                  {t.yourQuestion}
                </label>
                <textarea id="q" rows={3} className="field py-3" />
                <div>
                  <button type="button" className="btn-outline min-h-11">
                    {t.send}
                  </button>
                </div>
              </form>
            </details>
          </div>
        </section>
      </div>

      {seller && others.length > 0 && (
        <section className="pt-24">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-4xl font-medium">
              {seller.name} {t.moreFrom}
            </h2>
            <Link href={`/shops/${seller.slug}`} className="link-caps">
              {t.viewShop}
            </Link>
          </div>
          <ProductGrid>
            {others.map((o) => (
              <ProductCard key={o.id} p={o} lang={lang} t={t} showCategory={false} />
            ))}
          </ProductGrid>
        </section>
      )}
    </div>
  );
}
