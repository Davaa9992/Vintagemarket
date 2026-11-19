import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { ProductArt } from "@/components/product-art";
import { getProducts, getSellers } from "@/lib/api";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = { title: "Дэлгүүрүүд" };

export default async function ShopsPage() {
  const { t } = await getDict();
  const [sellers, products] = await Promise.all([getSellers(), getProducts()]);
  return (
    <div className="container-vm pt-10">
      <h1 className="mb-8 font-serif text-[clamp(40px,5vw,56px)] leading-none font-medium">{t.shops}</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
        {sellers.map((s) => (
          <Link key={s.slug} href={`/shops/${s.slug}`} className="flex flex-col gap-4 bg-paper p-5 hover:text-ink">
            <span className="grid grid-cols-3 gap-2">
              {products
                .filter((p) => p.seller === s.slug)
                .slice(0, 3)
                .map((p) => (
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
    </div>
  );
}
