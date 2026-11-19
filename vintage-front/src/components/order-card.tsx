import { formatMNT } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import type { OrderView, SellerOrderStatus } from "@/lib/types";
import { ProductArt } from "./product-art";

const PILL: Record<SellerOrderStatus, string> = {
  pending: "bg-sand text-sand-ink",
  paid: "bg-sand text-sand-ink",
  shipped: "bg-olive-soft text-olive-ink",
  delivered: "bg-olive-soft text-olive-ink",
  cancelled: "bg-paper text-muted",
};

export function statusLabel(t: Dict, s: SellerOrderStatus): string {
  return { pending: t.stPendingBuyer, paid: t.stPaidBuyer, shipped: t.stShipped, delivered: t.stDelivered, cancelled: t.stCancelled }[s];
}

/** Худалдан авагчийн захиалга: дэлгүүр бүрийн төлөв, бараанууд, нийт дүн */
export function OrderCard({ o, t, lang }: { o: OrderView; t: Dict; lang: "mn" | "en" }) {
  return (
    <article className="flex flex-col border border-line bg-field">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <strong className="text-base">{o.code}</strong>
        <span className="text-[13px] text-muted">
          {t.orderDate}: {new Date(o.createdAt).toLocaleDateString(lang === "mn" ? "mn-MN" : "en-GB")}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${PILL[o.status]}`}>{statusLabel(t, o.status)}</span>
      </header>
      {o.shops.length > 1 && (
        <ul className="flex flex-wrap gap-2 border-b border-line-soft px-5 py-3 text-[13px]">
          {o.shops.map((s) => (
            <li key={s.name} className="flex items-center gap-2">
              <span className="font-semibold">{s.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${PILL[s.status]}`}>{statusLabel(t, s.status)}</span>
            </li>
          ))}
        </ul>
      )}
      <ul className="flex flex-col">
        {o.items.map((i, k) => (
          <li key={k} className="flex items-center gap-3.5 border-b border-line-soft px-5 py-3 last:border-b-0">
            {i.image && <ProductArt src={i.image} tone={0} className="w-12 flex-none" sizes="48px" />}
            <span className="min-w-0 flex-1 text-sm font-semibold">{i.name}</span>
            <span className="text-sm whitespace-nowrap">{formatMNT(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <footer className="flex justify-between gap-3 border-t border-line px-5 py-3.5 text-sm">
        <span className="text-muted">{o.delivery === "pickup" ? t.pickup : t.delivery}</span>
        <strong>
          {t.total}: {formatMNT(o.total)}
        </strong>
      </footer>
    </article>
  );
}
