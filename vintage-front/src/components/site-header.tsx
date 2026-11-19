import Link from "next/link";
import { CATEGORY_NAMES, type Dict, type Lang } from "@/lib/i18n";
import { CATEGORY_SLUGS } from "@/lib/types";
import { LangSwitch } from "./lang-provider";
import { CartLink, FavCount } from "./header-client";
import { SearchIcon, UserIcon } from "./icons";
import { Wordmark } from "./wordmark";

export function SiteHeader({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <header className="border-b border-line bg-cream">
      <div className="bg-ink text-xs tracking-wide text-[#efe8da]">
        <div className="container-vm flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">
          <span>{t.topbar}</span>
          <Link href="/seller" className="text-[#efe8da] hover:text-white">
            {t.becomeSeller} →
          </Link>
        </div>
      </div>
      <div className="container-vm grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 pt-4">
        <div className="hidden items-center gap-3 sm:flex">
          <LangSwitch />
          <span className="text-[13px] text-faint">₮ MNT</span>
        </div>
        <Link href="/" aria-label="Vintage Mongolia" className="col-start-2 text-ink hover:text-ink">
          <Wordmark />
        </Link>
        <div className="col-start-3 flex justify-end">
          <Link href="/products" aria-label={t.search} className="inline-flex size-11 items-center justify-center text-ink">
            <SearchIcon />
          </Link>
          <FavCount label={t.favorites} />
          <Link href="/account" aria-label={t.account} className="inline-flex size-11 items-center justify-center text-ink">
            <UserIcon />
          </Link>
          <CartLink label={t.cart} />
        </div>
      </div>
      <nav aria-label={t.categoriesNav} className="no-scrollbar container-vm flex gap-7 overflow-x-auto py-4 text-sm whitespace-nowrap">
        <Link href="/products" className="font-bold">
          {t.newIn}
        </Link>
        {CATEGORY_SLUGS.map((c) => (
          <Link key={c} href={`/products?category=${c}`}>
            {CATEGORY_NAMES[lang][c]}
          </Link>
        ))}
        <Link href="/shops">{t.shops}</Link>
      </nav>
      <div className="container-vm flex items-center gap-3 pb-3 sm:hidden">
        <LangSwitch />
        <span className="text-[13px] text-faint">₮ MNT</span>
      </div>
    </header>
  );
}
