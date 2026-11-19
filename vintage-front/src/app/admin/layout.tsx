import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { logoutAction } from "@/lib/actions";
import { getAdminContext } from "@/lib/admin";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = { title: "Админ", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getDict();
  const ctx = await getAdminContext();
  return (
    <>
      <header className="bg-ink text-[#efe8da]">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" aria-label="Vintage Mongolia" className="flex items-baseline gap-2.5 text-cream hover:text-cream">
            <span className="font-serif text-[28px] font-medium">Vintage</span>
            <span className="text-[9px] font-bold tracking-[0.42em] text-gold">MONGOLIA</span>
            <span className="ml-1.5 text-xs text-gold">{t.adminArea}</span>
          </Link>
          {ctx && (
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden sm:inline">{ctx.user.name}</span>
              <form action={logoutAction}>
                <button type="submit" className="min-h-9 cursor-pointer text-[#efe8da] underline hover:text-white">
                  {t.logout}
                </button>
              </form>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-[1360px] px-4 pt-8 pb-20 sm:px-6">
        {ctx ? (
          <>
            <AdminNav />
            {children}
          </>
        ) : (
          <p className="bg-paper px-4 py-3 text-sm text-ink-2">{t.adminNeedsBackend}</p>
        )}
      </main>
    </>
  );
}
