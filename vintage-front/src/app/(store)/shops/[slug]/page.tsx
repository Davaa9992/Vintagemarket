import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { FollowButton, ShopTabs } from "@/components/shop-tabs";
import { getProducts, getReviews, getSeller } from "@/lib/api";
import { getDict } from "@/lib/lang";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const s = await getSeller((await params).slug);
  return { title: s?.name ?? "Дэлгүүр" };
}

export default async function ShopPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { lang, t } = await getDict();
  const seller = await getSeller(slug);
  if (!seller) notFound();
  const [products, reviews] = await Promise.all([getProducts({ seller: slug }), getReviews(slug)]);
  const banner = products.slice(0, 3);

  return (
    <div className="container-vm pt-6">
      <div className="relative h-[clamp(180px,22vw,300px)] overflow-hidden" style={{ background: "linear-gradient(#E3D7C3 0 68%, #CFBFA3 68% 100%)" }}>
        {/* eslint-disable @next/next/no-img-element */}
        {banner[1] && <img src={banner[1].images[0]} alt="" className="absolute right-[30%] bottom-[6%] h-[74%]" />}
        {banner[0] && <img src={banner[0].images[0]} alt="" className="absolute right-[16%] bottom-[6%] h-[84%]" />}
        {banner[2] && <img src={banner[2].images[0]} alt="" className="absolute right-[4%] bottom-[6%] h-[50%]" />}
        {/* eslint-enable @next/next/no-img-element */}
      </div>
      <div className="relative -mt-12 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 pl-0 sm:pl-6">
        <div className="flex flex-wrap items-end gap-6">
          <span className="rounded-full border-[6px] border-cream">
            <Avatar initials={seller.initials} size={108} />
          </span>
          <div className="flex flex-col gap-1.5 pb-1.5">
            <h1 className="font-serif text-[clamp(36px,4vw,52px)] leading-none font-medium">{seller.name}</h1>
            <span className="text-sm text-muted">
              {[seller.city, seller.district].filter(Boolean).join(", ")} · {lang === "mn" ? `${seller.since} ${t.since}` : `${t.since} ${seller.since}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5 pb-1.5">
          <FollowButton />
          <button type="button" className="btn-outline">
            {t.message}
          </button>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-start gap-10">
        <p className="max-w-[720px] flex-[3_1_420px] text-base leading-[1.7] text-ink-2">{seller.bio}</p>
        <dl className="grid flex-[2_1_300px] grid-cols-3 gap-px border border-line bg-line">
          {[
            [t.listingsStat, seller.listings],
            [t.soldStat, seller.sold],
            [t.ratingStat, seller.rating.toFixed(1)],
          ].map(([k, v]) => (
            <div key={k} className="bg-cream p-4">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 font-serif text-3xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ShopTabs
        labels={{ items: `${t.listingsStat} (${products.length})`, reviews: t.reviews, about: t.about }}
        items={
          <ProductGrid>
            {products.map((p) => (
              <ProductCard key={p.id} p={p} lang={lang} t={t} showCategory={false} />
            ))}
          </ProductGrid>
        }
        reviews={
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
            {reviews.map((r) => (
              <figure key={r.who + r.item} className="flex flex-col gap-3.5 bg-paper p-6">
                <span aria-label={`${r.stars}/5`} className="text-base tracking-[3px] text-olive">
                  {"★".repeat(r.stars)}
                  {"☆".repeat(5 - r.stars)}
                </span>
                <blockquote className="font-serif text-[22px] leading-snug">{r.text}</blockquote>
                <figcaption className="text-[13px] text-muted">
                  {r.who} · {r.item}
                </figcaption>
              </figure>
            ))}
          </div>
        }
        about={
          <div className="grid max-w-[1000px] grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8">
            {[
              [t.shipping, t.shippingReturnsText],
              [t.payment, t.paymentNote],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2 border-t border-ink pt-4">
                <strong>{k}</strong>
                <span className="text-[15px] leading-relaxed text-ink-2">{v}</span>
              </div>
            ))}
          </div>
        }
      />
    </div>
  );
}
