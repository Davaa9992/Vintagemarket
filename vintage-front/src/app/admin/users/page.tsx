import { SearchForm } from "@/components/admin/search-form";
import { StatusSelect } from "@/components/admin/status-select";
import { getAdminUsers } from "@/lib/api";
import { adminUserBlockAction } from "@/lib/actions";
import { getAdminContext } from "@/lib/admin";
import { getDict } from "@/lib/lang";

type Search = Promise<{ q?: string }>;

export default async function AdminUsers({ searchParams }: { searchParams: Search }) {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const { lang, t } = await getDict();
  const { q = "" } = await searchParams;
  const users = await getAdminUsers(ctx.token, q.trim().slice(0, 60));
  const roles: Record<string, string> = { customer: t.roleCustomer, seller: t.roleSeller, admin: t.roleAdmin };
  const options = [
    { value: "0", label: t.userActive },
    { value: "1", label: t.userBlocked },
  ];
  return (
    <>
      <SearchForm q={q} placeholder={t.searchUsers} label={t.search} />
      <div className="overflow-x-auto border border-line bg-field">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold tracking-wider text-muted uppercase">
              <th scope="col" className="px-4 py-3">{t.name}</th>
              <th scope="col" className="px-4 py-3">{t.phone}</th>
              <th scope="col" className="px-4 py-3">{t.role}</th>
              <th scope="col" className="px-4 py-3">{t.joined}</th>
              <th scope="col" className="px-4 py-3 text-right">{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line-soft last:border-b-0">
                <td className="px-4 py-3.5 font-semibold">{u.name}</td>
                <td className="px-4 py-3.5">{u.phone}</td>
                <td className="px-4 py-3.5">{roles[u.role] ?? u.role}</td>
                <td className="px-4 py-3.5 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString(lang === "mn" ? "mn-MN" : "en-GB")}</td>
                <td className="px-4 py-3.5 text-right">
                  {u.id === ctx.user.id ? (
                    <span className="text-muted">{t.userActive}</span>
                  ) : (
                    <StatusSelect id={u.id} value={u.blocked ? "1" : "0"} options={options} label={`${t.status} ${u.name}`} action={adminUserBlockAction} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
