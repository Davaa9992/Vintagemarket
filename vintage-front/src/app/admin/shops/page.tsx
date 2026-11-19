import Link from "next/link";
import { SearchForm } from "@/components/admin/search-form";
import { StatusSelect } from "@/components/admin/status-select";
import { getAdminShops } from "@/lib/api";
import { adminShopStatusAction } from "@/lib/actions";
import { getAdminContext } from "@/lib/admin";
import { getDict } from "@/lib/lang";

type Search = Promise<{ q?: string }>;

export default async function AdminShops({ searchParams }: { searchParams: Search }) {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { t } = await getDict();
  const { q = "" } = await searchParams;
  const shops = await getAdminShops(ctx.token, q.trim().slice(0, 60));
  const options = [
    { value: "active", label: t.shopActive },
    { value: "paused", label: t.shopPaused },
    { value: "blocked", label: t.shopBlocked },
  ];
  return (
    <>
      <SearchForm q={q} placeholder={t.searchShops} label={t.search} />
      <div className="overflow-x-auto border border-line bg-field">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold tracking-wider text-muted uppercase">
              <th scope="col" className="px-4 py-3">{t.shopName}</th>
              <th scope="col" className="px-4 py-3">{t.owner}</th>
              <th scope="col" className="px-4 py-3">{t.city}</th>
              <th scope="col" className="px-4 py-3">{t.activeListings}</th>
              <th scope="col" className="px-4 py-3 text-right">{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s.id} className="border-b border-line-soft last:border-b-0">
                <td className="px-4 py-3.5 font-semibold">
                  <Link href={`/shops/${s.slug}`}>{s.name}</Link>
                </td>
                <td className="px-4 py-3.5">
                  {s.owner}
                  <span className="block text-xs text-muted">{s.phone}</span>
                </td>
                <td className="px-4 py-3.5">{s.city}</td>
                <td className="px-4 py-3.5">{s.listings}</td>
                <td className="px-4 py-3.5 text-right">
                  <StatusSelect id={s.id} value={s.status} options={options} label={`${t.status} ${s.name}`} action={adminShopStatusAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
