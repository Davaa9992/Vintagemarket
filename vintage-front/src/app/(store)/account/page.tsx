import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderCard } from "@/components/order-card";
import { getMyOrders, hasBackend } from "@/lib/api";
import { logoutAction } from "@/lib/actions";
import { getDict } from "@/lib/lang";
import { getSession, getToken } from "@/lib/session";

export const metadata: Metadata = { title: "Миний бүртгэл" };

export default async function AccountPage() {
  const { lang, t } = await getDict();
  if (!hasBackend) redirect("/seller");
  const [user, token] = await Promise.all([getSession(), getToken()]);
  if (!user || !token) redirect("/login?next=/account");
  const orders = await getMyOrders(token);
  return (
    <div className="container-vm pt-10 pb-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[13px] text-muted">{user.phone}</span>
          <h1 className="mt-1 font-serif text-[clamp(32px,4vw,44px)] leading-none font-medium">
            {t.hello}, {user.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {user.role === "admin" && (
            <Link href="/admin" className="btn-outline">
              {t.adminArea}
            </Link>
          )}
          <Link href="/seller" className="btn-outline">
            {user.shop ? t.sellerDashboard : t.openShop}
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="min-h-11 cursor-pointer px-2 text-sm font-semibold underline">
              {t.logout}
            </button>
          </form>
        </div>
      </div>
      <h2 className="mb-4 font-serif text-3xl font-medium">{t.myOrders}</h2>
      {orders.length === 0 ? (
        <p className="text-muted">{t.noMyOrders}</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {orders.map((o) => (
            <OrderCard key={o.code} o={o} t={t} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
