import Link from "next/link";
import { LockIcon } from "@/components/icons";
import { Wordmark } from "@/components/wordmark";
import { getDict } from "@/lib/lang";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getDict();
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Vintage Mongolia">
            <Wordmark size="sm" align="start" />
          </Link>
          <span className="flex items-center gap-2 text-[13px] text-muted">
            <LockIcon size={16} />
            {t.secure}
          </span>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
