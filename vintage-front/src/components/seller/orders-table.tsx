"use client";
import { useState, useTransition } from "react";
import { markShippedAction } from "@/lib/actions";
import { formatMNT } from "@/lib/format";
import type { SellerOrder, SellerOrderStatus } from "@/lib/types";
import { useLang } from "../lang-provider";

/** live: backend-д төлөв хадгална. Үгүй бол зөвхөн дэлгэц дээр (жишээ) */
export function OrdersTable({ orders, live = false }: { orders: SellerOrder[]; live?: boolean }) {
  const { t } = useLang();
  const [shipped, setShipped] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const pill: Record<SellerOrderStatus, [string, string]> = {
    pending: [t.stPending, "bg-brick-soft text-brick-ink"],
    paid: [t.stPaid, "bg-brick-soft text-brick-ink"],
    shipped: [t.stShipped, "bg-sand text-sand-ink"],
    delivered: [t.stDelivered, "bg-olive-soft text-olive-ink"],
    cancelled: [t.stCancelled, "bg-paper text-muted"],
  };
  const ship = (o: SellerOrder) => {
    setError(undefined);
    if (!live || !o.ref) {
      setShipped((s) => ({ ...s, [o.id]: true }));
      return;
    }
    const ref = o.ref;
    start(async () => {
      const res = await markShippedAction(ref);
      if (res.error) setError(res.error);
      else setShipped((s) => ({ ...s, [o.id]: true }));
    });
  };
  return (
    <>
      {error && (
        <p role="alert" className="mb-3 bg-brick-soft px-4 py-3 text-sm font-semibold text-brick-ink">
          {error}
        </p>
      )}
      <div className="overflow-x-auto border border-line bg-field">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold tracking-wider text-muted uppercase">
              <th scope="col" className="px-4 py-3">{t.orderId}</th>
              <th scope="col" className="px-4 py-3">{t.items}</th>
              <th scope="col" className="px-4 py-3">{t.buyer}</th>
              <th scope="col" className="px-4 py-3">{t.amount}</th>
              <th scope="col" className="px-4 py-3">{t.status}</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">{t.actions}</span></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  {t.noOrders}
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const canShip = o.status === "paid" || o.status === "pending";
              const st: SellerOrderStatus = canShip && shipped[o.id] ? "shipped" : o.status;
              return (
                <tr key={o.id} className="border-b border-line-soft last:border-b-0">
                  <td className="px-4 py-3.5 font-bold whitespace-nowrap">{o.id}</td>
                  <td className="px-4 py-3.5">{o.items}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">{o.buyer}</td>
                  <td className="px-4 py-3.5 font-bold whitespace-nowrap">{formatMNT(o.total)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${pill[st][1]}`}>{pill[st][0]}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {canShip && st !== "shipped" && (
                      <button type="button" disabled={pending} className="btn-primary min-h-10 px-3.5 text-[13px]" onClick={() => ship(o)}>
                        {t.markShipped}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
