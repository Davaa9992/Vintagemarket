import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingForm } from "@/components/seller/listing-form";
import { getSellerProduct, hasBackend } from "@/lib/api";
import { getDict } from "@/lib/lang";
import { PRODUCTS } from "@/lib/mock-data";
import { getSellerContext } from "@/lib/seller";
import { DEMO_SELLER } from "@/lib/session";

type Params = Promise<{ id: string }>;

export default async function EditListing({ params }: { params: Params }) {
  const ctx = await getSellerContext();
  if (ctx.mode === "live" && !ctx.slug) return null;
  const { id } = await params;
  const { t } = await getDict();
  const product =
    ctx.mode === "live" ? await getSellerProduct(ctx.token, id) : PRODUCTS.find((p) => p.id === id && p.seller === DEMO_SELLER);
  if (!product) notFound();
  return (
    <>
      <Link href="/seller/products" className="text-[13px] text-olive underline">
        {t.backToListings}
      </Link>
      <h1 className="mt-3 mb-7 font-serif text-[clamp(32px,4vw,44px)] leading-none font-medium">{t.editListing}</h1>
      <ListingForm live={hasBackend} initial={product} />
    </>
  );
}
