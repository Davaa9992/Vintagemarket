import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { hasBackend } from "@/lib/api";
import { getDict } from "@/lib/lang";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Нэвтрэх" };

type Search = Promise<{ next?: string }>;

export default async function Page({ searchParams }: { searchParams: Search }) {
  const { t } = await getDict();
  const raw = (await searchParams).next ?? "/";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  if (await getSession()) redirect(next);
  return (
    <div className="container-vm flex justify-center pt-14 pb-10">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-5xl font-medium">{t.loginTitle}</h1>
          <p className="text-[15px] text-ink-2">{t.loginIntro}</p>
        </div>
        {!hasBackend && <p className="bg-paper px-4 py-3 text-sm text-ink-2">{t.demoNote}</p>}
        <AuthForm mode="login" next={next} />
      </div>
    </div>
  );
}
