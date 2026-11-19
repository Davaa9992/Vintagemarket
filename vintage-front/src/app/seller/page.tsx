import Link from "next/link";
import { OrdersTable } from "@/components/seller/orders-table";
import { getSellerOrders, getSellerSummary } from "@/lib/api";
import { COMMISSION, formatMNT } from "@/lib/format";
import { getDict } from "@/lib/lang";
import { SELLER_ORDERS } from "@/lib/mock-data";
import { getSellerContext } from "@/lib/seller";
import type { SellerOrder, SellerSummary } from "@/lib/types";

/** Backend байхгүй үеийн жишээ тоо */
const DEMO_SUMMARY: SellerSummary = {
  monthSales: 1845000,
  monthCommission: 1845000 * COMMISSION,
  monthPayout: 1845000 * (1 - COMMISSION),
  monthOrders: 9,
  toShip: SELLER_ORDERS.filter((o) => o.status === "paid").length,
  activeListings: 24,
  drafts: 2,
};

export default async function SellerOverview() {
  const { lang, t } = await getDict();
  const ctx = await getSellerContext();
  // Дэлгүүргүй бол layout дэлгүүр нээх формыг харуулна
  if (ctx.mode === "live" && !ctx.slug) return null;
  let s = DEMO_SUMMARY;
  let orders: SellerOrder[] = SELLER_ORDERS;
  if (ctx.mode === "live") [s, orders] = await Promise.all([getSellerSummary(ctx.token), getSellerOrders(ctx.token, 5)]);
  const name = ctx.mode === "live" ? (ctx.user.shop?.name ?? ctx.user.name) : ctx.seller?.name;
  const month = new Date().toLocaleDateString(lang === "mn" ? "mn-MN" : "en-GB", { year: "numeric", month: "long" });
  const stats = [
    { k: t.salesMonth, v: formatMNT(s.monthSales), note: lang === "mn" ? `${s.monthOrders} захиалга` : `${s.monthOrders} orders` },
    { k: t.payoutLabel, v: formatMNT(s.monthPayout), note: `10% ${t.commission}: ${formatMNT(s.monthCommission)}` },
    { k: t.toShip, v: String(s.toShip), note: t.shipWithin, alert: s.toShip > 0 },
    { k: t.activeListings, v: String(s.activeListings), note: lang === "mn" ? `${s.drafts} ноорог` : `${s.drafts} drafts` },
  ];
  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[13px] text-muted">{month}</span>
          <h1 className="mt-1 font-serif text-[clamp(32px,4vw,44px)] leading-none font-medium">
            {t.hello}, {name}
          </h1>
        </div>
        <Link href="/seller/products/new" className="btn-primary">
          {t.addListing}
        </Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {stats.map((x) => (
          <div key={x.k} className="flex flex-col gap-1.5 border border-line bg-field p-5">
            <span className="text-[13px] text-muted">{x.k}</span>
            <strong className={`font-serif text-4xl font-semibold ${x.alert ? "text-brick" : ""}`}>{x.v}</strong>
            <span className="text-xs text-muted">{x.note}</span>
          </div>
        ))}
      </div>
      <h2 className="mt-12 mb-4 font-serif text-3xl font-medium">{t.recentOrders}</h2>
      <OrdersTable orders={orders} live={ctx.mode === "live"} />
    </>
  );
}
