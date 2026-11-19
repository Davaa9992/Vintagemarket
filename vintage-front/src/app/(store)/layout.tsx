import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDict } from "@/lib/lang";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getDict();
  return (
    <>
      <SiteHeader lang={lang} t={t} />
      <main>{children}</main>
      <SiteFooter t={t} />
    </>
  );
}
