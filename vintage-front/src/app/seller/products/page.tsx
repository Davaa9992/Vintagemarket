import Link from "next/link";
import { ProductArt } from "@/components/product-art";
import { DeleteListing } from "@/components/seller/delete-listing";
import { getProducts, getSellerProducts } from "@/lib/api";
import { formatMNT } from "@/lib/format";
import { CATEGORY_NAMES } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { DEMO_SELLER } from "@/lib/session";
import { getSellerContext } from "@/lib/seller";

export default async function SellerProducts() {
  const { lang, t } = await getDict();
  const ctx = await getSellerContext();
  // Дэлгүүргүй бол layout дэлгүүр нээх формыг харуулна
  if (ctx.mode === "live" && !ctx.slug) return null;
  const products = ctx.mode === "live" ? await getSellerProducts(ctx.token) : await getProducts({ seller: DEMO_SELLER });
  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[clamp(32px,4vw,44px)] leading-none font-medium">{t.myListings}</h1>
        <Link href="/seller/products/new" className="btn-primary">
          {t.addListing}
        </Link>
      </div>
      <div className="overflow-x-auto border border-line bg-field">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold tracking-wider text-muted uppercase">
              <th scope="col" className="px-4 py-3">{t.items}</th>
              <th scope="col" className="px-4 py-3">{t.category}</th>
              <th scope="col" className="px-4 py-3">{t.condition}</th>
              <th scope="col" className="px-4 py-3">{t.amount}</th>
              <th scope="col" className="px-4 py-3">{t.status}</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">{t.actions}</span></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  {t.noListings}
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line-soft last:border-b-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3.5">
                    <ProductArt src={p.images[0]} tone={p.tone} className="w-12 flex-none" sizes="48px" />
                    <Link href={`/products/${p.slug}`} className="font-semibold">
                      {p.name}
                    </Link>
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{CATEGORY_NAMES[lang][p.category]}</td>
                <td className="px-4 py-3">{p.grade}</td>
                <td className="px-4 py-3 font-bold whitespace-nowrap">{formatMNT(p.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
                      p.status === "available" ? "bg-olive-soft text-olive-ink" : p.status === "draft" ? "bg-sand text-sand-ink" : "bg-paper text-muted"
                    }`}
                  >
                    {p.status === "available" ? t.stActive : p.status === "draft" ? t.stDraft : t.sold}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex flex-wrap items-center justify-end gap-1">
                    <Link href={`/seller/products/${p.id}`} className="inline-flex min-h-10 items-center px-2 text-[13px] font-semibold text-olive underline">
                      {t.edit}
                    </Link>
                    {p.status !== "sold" && <DeleteListing id={p.id} live={ctx.mode === "live"} />}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
