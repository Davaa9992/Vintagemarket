import { SearchForm } from "@/components/admin/search-form";
import { statusLabel } from "@/components/order-card";
import { StatusSelect } from "@/components/admin/status-select";
import { ADMIN_ORDER_STATUSES, getAdminOrders, getAdminSummary, type AdminOrderStatus } from "@/lib/api";
import { adminOrderStatusAction } from "@/lib/actions";
import { getAdminContext } from "@/lib/admin";
import { formatMNT } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import { getDict } from "@/lib/lang";

type Search = Promise<{ q?: string; status?: string }>;

const statusName = (t: Dict, s: AdminOrderStatus) =>
  ({ pending: t.stPendingBuyer, paid: t.stPaidBuyer, shipped: t.stShipped, completed: t.stCompleted, cancelled: t.stCancelled })[s];

export default async function AdminOrders({ searchParams }: { searchParams: Search }) {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { lang, t } = await getDict();
  const { q = "", status = "" } = await searchParams;
  const st = (ADMIN_ORDER_STATUSES as string[]).includes(status) ? status : "";
  const [summary, orders] = await Promise.all([
    getAdminSummary(ctx.token),
    getAdminOrders(ctx.token, { status: st, search: q.trim().slice(0, 60) }),
  ]);
  const options = ADMIN_ORDER_STATUSES.map((s) => ({ value: s, label: statusName(t, s) }));
  const stats = [
    { k: t.revenue, v: formatMNT(summary.revenue) },
    { k: t.commissionEarned, v: formatMNT(summary.commission) },
    ...ADMIN_ORDER_STATUSES.filter((s) => s !== "cancelled").map((s) => ({ k: statusName(t, s), v: String(summary.byStatus[s] ?? 0) })),
  ];
  return (
    <>
      <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
        {stats.map((x) => (
          <div key={x.k} className="flex flex-col gap-1.5 border border-line bg-field p-5">
            <span className="text-[13px] text-muted">{x.k}</span>
            <strong className="font-serif text-3xl font-semibold">{x.v}</strong>
          </div>
        ))}
      </div>
      <SearchForm q={q} placeholder={t.searchOrders} label={t.search}>
        <select name="status" defaultValue={st} className="field min-h-11 w-auto" aria-label={t.status}>
          <option value="">{t.allStatuses}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </SearchForm>
      <div className="overflow-x-auto border border-line bg-field">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold tracking-wider text-muted uppercase">
              <th scope="col" className="px-4 py-3">{t.orderId}</th>
              <th scope="col" className="px-4 py-3">{t.customer}</th>
              <th scope="col" className="px-4 py-3">{t.items}</th>
              <th scope="col" className="px-4 py-3">{t.shopsAdmin}</th>
              <th scope="col" className="px-4 py-3">{t.amount}</th>
              <th scope="col" className="px-4 py-3 text-right">{t.status}</th>
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
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line-soft align-top last:border-b-0">
                <td className="px-4 py-3.5">
                  <strong className="whitespace-nowrap">{o.code}</strong>
                  <span className="block text-xs text-muted">{new Date(o.createdAt).toLocaleDateString(lang === "mn" ? "mn-MN" : "en-GB")}</span>
                </td>
                <td className="px-4 py-3.5">
                  {o.customer.name}
                  <span className="block text-xs text-muted">{o.customer.phone}</span>
                  <span className="block max-w-[220px] text-xs text-muted">{o.delivery === "pickup" ? t.pickup : o.customer.address}</span>
                </td>
                <td className="max-w-[260px] px-4 py-3.5">{o.items}</td>
                <td className="px-4 py-3.5 text-xs">
                  {o.shops.map((s) => (
                    <span key={s.name} className="block whitespace-nowrap">
                      {s.name}: <span className="text-muted">{statusLabel(t, s.status)}</span>
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3.5 font-bold whitespace-nowrap">
                  {formatMNT(o.total)}
                  <span className="block text-xs font-normal text-muted uppercase">{o.payment}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <StatusSelect id={o.id} value={o.status} options={options} label={`${t.status} ${o.code}`} action={adminOrderStatusAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
