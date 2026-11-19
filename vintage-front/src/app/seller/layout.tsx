import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { OpenShopForm } from "@/components/seller/open-shop-form";
import { SellerNav } from "@/components/seller/seller-nav";
import { logoutAction } from "@/lib/actions";
import { getDict } from "@/lib/lang";
import { getSellerContext } from "@/lib/seller";

export const metadata: Metadata = { title: "Худалдагчийн самбар" };

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getDict();
  const ctx = await getSellerContext();
  const shop = ctx.mode === "live" ? ctx.user.shop : ctx.seller;
  // Дэлгүүр нийтэд хаалттай (paused) үед ч өөрийн нэр, товчийг харуулна
  const name = ctx.seller?.name ?? shop?.name;
  const initials = ctx.seller?.initials ?? shop?.initials ?? "";
  const needsShop = ctx.mode === "live" && !ctx.user.shop;
  return (
    <>
      <header className="bg-ink text-[#efe8da]">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" aria-label="Vintage Mongolia" className="flex items-baseline gap-2.5 text-cream hover:text-cream">
            <span className="font-serif text-[28px] font-medium">Vintage</span>
            <span className="text-[9px] font-bold tracking-[0.42em] text-gold">MONGOLIA</span>
            <span className="ml-1.5 text-xs text-gold">{t.sellerArea}</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {shop && (
              <Link href={`/shops/${shop.slug}`} className="text-[#efe8da] underline hover:text-white">
                {t.viewMyShop}
              </Link>
            )}
            {name && (
              <span className="flex items-center gap-2.5">
                <Avatar initials={initials} size={34} />
                <span className="hidden sm:inline">{name}</span>
              </span>
            )}
            {ctx.mode === "live" && (
              <form action={logoutAction}>
                <button type="submit" className="min-h-9 cursor-pointer text-[#efe8da] underline hover:text-white">
                  {t.logout}
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      {needsShop ? (
        <main className="mx-auto max-w-[1360px] px-4 pt-10 pb-20 sm:px-6">
          <h1 className="font-serif text-[clamp(32px,4vw,44px)] leading-none font-medium">{t.openShop}</h1>
          <p className="mt-3 mb-8 max-w-[640px] text-[15px] text-ink-2">{t.openShopIntro}</p>
          <OpenShopForm />
        </main>
      ) : (
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-start gap-10 px-4 pt-8 pb-20 sm:px-6">
          <SellerNav />
          <main className="min-w-0 flex-[999_1_560px]">{children}</main>
        </div>
      )}
    </>
  );
}
