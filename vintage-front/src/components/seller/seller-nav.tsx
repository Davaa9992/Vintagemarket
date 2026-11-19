"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "../lang-provider";

export function SellerNav() {
  const { t } = useLang();
  const path = usePathname();
  const items = [
    { href: "/seller", label: t.overview },
    { href: "/seller/orders", label: t.orders, badge: "1" },
    { href: "/seller/products", label: t.myListings },
    { href: "/seller/products/new", label: t.newListing },
  ];
  return (
    <nav aria-label={t.sellerArea} className="flex w-full flex-col gap-1 md:max-w-[240px] md:flex-[1_1_200px]">
      <div className="no-scrollbar flex gap-1 overflow-x-auto md:flex-col">
        {items.map((i) => {
          const on = path === i.href;
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-11 items-center justify-between gap-3 rounded-[2px] px-3.5 text-sm font-semibold whitespace-nowrap ${
                on ? "bg-ink text-cream hover:text-cream" : "text-ink hover:bg-paper"
              }`}
            >
              {i.label}
              {i.badge && <span className="text-xs opacity-80">{i.badge}</span>}
            </Link>
          );
        })}
      </div>
      <p className="mt-5 hidden bg-paper p-4 text-[13px] leading-relaxed text-ink-2 md:block">
        {t.commission10}. {t.commissionNote}
      </p>
    </nav>
  );
}
