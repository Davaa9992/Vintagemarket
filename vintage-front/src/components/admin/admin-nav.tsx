"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "../lang-provider";

export function AdminNav() {
  const { t } = useLang();
  const path = usePathname();
  const items = [
    { href: "/admin", label: t.allOrders },
    { href: "/admin/shops", label: t.shopsAdmin },
    { href: "/admin/users", label: t.usersAdmin },
  ];
  return (
    <nav aria-label={t.adminArea} className="no-scrollbar mb-8 flex gap-1 overflow-x-auto border-b border-line">
      {items.map((i) => {
        const on = path === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={`-mb-px flex min-h-11 items-center border-b-2 px-3.5 text-sm font-semibold whitespace-nowrap ${on ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
