import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { getDict } from "@/lib/lang";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <main className="container-vm flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <Link href="/" aria-label="Vintage Mongolia">
        <Wordmark />
      </Link>
      <h1 className="font-serif text-5xl font-medium">{t.notFound}</h1>
      <p className="text-muted">{t.notFoundText}</p>
      <Link href="/products" className="btn-primary">
        {t.shopNow}
      </Link>
    </main>
  );
}
