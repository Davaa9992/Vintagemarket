import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { NewInTabs } from "@/components/new-in-tabs";
import { ProductArt } from "@/components/product-art";
import { getCategories, getProducts, getSellers } from "@/lib/api";
import { toneBackground } from "@/lib/format";
import { CATEGORY_NAMES } from "@/lib/i18n";
import { getDict } from "@/lib/lang";

export default async function HomePage() {
  const { lang, t } = await getDict();
  const [products, categories, sellers] = await Promise.all([getProducts(), getCategories(), getSellers()]);
  const byId = new Map(products.map((p) => [p.slug, p]));
  const featured = sellers.slice(0, 3).map((s) => ({ s, items: products.filter((p) => p.seller === s.slug).slice(0, 3) }));
  const pin = (slug: string) => byId.get(slug);

  return (
    <>
      {/* Hero */}
      <section className="container-vm flex flex-wrap items-center gap-12 pt-12">
        <div className="flex min-w-0 flex-[5_1_340px] flex-col gap-6">
          <span className="eyebrow text-olive">{t.heroEyebrow}</span>
          <h1 className="font-serif text-[clamp(44px,6vw,76px)] leading-[1.02] font-medium tracking-tight">{t.heroTitle}</h1>
          <p className="max-w-[460px] text-[17px] leading-relaxed text-muted">{t.heroText}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              {t.shopNow}
            </Link>
            <Link href="/seller" className="btn-outline">
              {t.becomeSeller}
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 border-t border-line pt-4 text-[13px] text-muted">
            <span>
              <strong className="text-ink">A–D</strong> {t.trustGrade}
            </span>
            <span>
              <strong className="text-ink">см</strong> {t.trustSize}
            </span>
            <span>
              <strong className="text-ink">QPay</strong> · {t.trustPay}
            </span>
          </div>
        </div>
        <Link
          href="/products?category=home"
          aria-label={CATEGORY_NAMES[lang].home}
          className="relative block aspect-[4/3] min-w-0 flex-[7_1_480px] overflow-hidden"
          style={{ background: toneBackground(0, 71) }}
        >
          {/* eslint-disable @next/next/no-img-element */}
          <img src="/items/chest.svg" alt="" className="absolute bottom-[10%] left-[6%] w-[46%]" />
          <img src="/items/jug.svg" alt="" className="absolute bottom-[47.4%] left-[18.5%] w-[15%]" />
          <img src="/items/chair.svg" alt="" className="absolute right-[6%] bottom-[8%] w-[40%]" />
          {/* eslint-enable @next/next/no-img-element */}
          <span className="absolute bottom-5 left-5 flex flex-col gap-0.5 bg-cream px-3.5 py-2.5 text-[13px]">
            <strong>{CATEGORY_NAMES[lang].home}</strong>
            <span className="text-muted">{t.heroCaption}</span>
          </span>
        </Link>
      </section>

      {/* Categories */}
      <section className="container-vm pt-24">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-serif text-[40px] font-medium">{t.categories}</h2>
          <Link href="/products" className="link-caps">
            {t.seeAll}
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:gap-5">
          {categories.map((c, i) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="group flex flex-col gap-2.5">
              <ProductArt src={c.image} tone={i + 1} ratio="aspect-square" />
              <span className="text-sm font-semibold group-hover:text-olive">{CATEGORY_NAMES[lang][c.slug]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New in */}
      <section className="container-vm pt-24">
        <NewInTabs products={products} sellers={sellers} />
      </section>

      {/* Curated collection */}
      <section className="container-vm mt-24">
        <div className="flex flex-wrap bg-night text-[#efe8da]">
          <div className="relative aspect-[4/3] min-w-0 flex-[7_1_480px] overflow-hidden" style={{ background: "linear-gradient(#CDBB9F 0 70%, #B7A283 70% 100%)" }}>
            {/* eslint-disable @next/next/no-img-element */}
            <img src="/items/radio.svg" alt="" className="absolute bottom-[9%] left-[6%] w-[40%]" />
            <img src="/items/snuff.svg" alt="" className="absolute bottom-[9%] left-[46%] w-[15%]" />
            <img src="/items/record.svg" alt="" className="absolute right-[5%] bottom-[9%] w-[34%]" />
            {/* eslint-enable @next/next/no-img-element */}
            {[
              { slug: "radio", pos: "left-[14%] top-[30%]" },
              { slug: "snuff", pos: "left-[42%] top-[52%]" },
              { slug: "record", pos: "right-[8%] top-[26%]" },
            ].map(({ slug, pos }) => {
              const p = pin(slug);
              if (!p) return null;
              return (
                <Link
                  key={slug}
                  href={`/products/${slug}`}
                  className={`absolute ${pos} hidden min-h-9 items-center gap-2 rounded-[2px] bg-cream py-2 pr-3 pl-2 text-[13px] font-semibold text-ink hover:bg-white sm:inline-flex`}
                >
                  <span className="size-2.5 rounded-full border-2 border-olive" />
                  {p.name.split(",")[0]}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-[5_1_320px] flex-col justify-center gap-5 p-[clamp(32px,5vw,64px)]">
            <span className="eyebrow text-gold">{t.collectionEyebrow}</span>
            <h2 className="font-serif text-[clamp(36px,4vw,52px)] leading-[1.05] font-medium text-cream">{t.collectionTitle}</h2>
            <p className="text-base leading-relaxed text-[#d9cfbe]">{t.collectionText}</p>
            <div>
              <Link href="/products?category=electronics,media,antiques" className="btn-cream">
                {t.collectionCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured shops */}
      <section className="container-vm pt-24">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-serif text-[40px] font-medium">{t.featuredShops}</h2>
          <Link href="/shops" className="link-caps">
            {t.allShops}
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
          {featured.map(({ s, items }) => (
            <Link key={s.slug} href={`/shops/${s.slug}`} className="flex flex-col gap-4 bg-paper p-5 hover:text-ink">
              <span className="grid grid-cols-3 gap-2">
                {items.map((p) => (
                  <ProductArt key={p.id} src={p.images[0]} tone={p.tone} ratio="aspect-square" />
                ))}
              </span>
              <span className="flex items-center gap-3.5">
                <Avatar initials={s.initials} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-serif text-[22px] font-semibold">{s.name}</span>
                  <span className="text-[13px] text-muted">
                    {s.city} · {s.focus}
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-vm pt-24">
        <h2 className="mb-8 font-serif text-[40px] font-medium">{t.howTitle}</h2>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8">
          {[
            [t.how1t, t.how1],
            [t.how2t, t.how2],
            [t.how3t, t.how3],
          ].map(([title, text], i) => (
            <li key={title} className="flex flex-col gap-2.5 border-t border-ink pt-5">
              <span className="font-serif text-[44px] leading-none text-olive">0{i + 1}</span>
              <strong className="text-[17px]">{title}</strong>
              <span className="text-[15px] leading-relaxed text-muted">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Seller CTA */}
      <section className="container-vm mt-24">
        <div className="flex flex-wrap items-center justify-between gap-8 bg-olive p-[clamp(32px,5vw,64px)] text-cream">
          <div className="flex max-w-[620px] flex-col gap-3">
            <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.05] font-medium">{t.sellCtaTitle}</h2>
            <p className="text-base leading-relaxed text-[#e6e8d8]">{t.sellCtaText}</p>
          </div>
          <Link href="/seller" className="btn-cream">
            {t.openShop}
          </Link>
        </div>
      </section>
    </>
  );
}
