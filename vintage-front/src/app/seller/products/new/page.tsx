import { hasBackend } from "@/lib/api";
import { getSellerContext } from "@/lib/seller";
import { ListingForm } from "@/components/seller/listing-form";
import { getDict } from "@/lib/lang";

export default async function NewListing() {
  const ctx = await getSellerContext();
  // Дэлгүүргүй бол layout дэлгүүр нээх формыг харуулна
  if (ctx.mode === "live" && !ctx.slug) return null;
  const { t } = await getDict();
  return (
    <>
      <h1 className="mb-2 font-serif text-[clamp(32px,4vw,44px)] leading-none font-medium">{t.newListing}</h1>
      <p className="mb-7 text-sm text-muted">{t.newListingHint}</p>
      <ListingForm live={hasBackend} />
    </>
  );
}
