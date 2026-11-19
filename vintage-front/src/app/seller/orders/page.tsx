import { OrdersTable } from "@/components/seller/orders-table";
import { getSellerOrders } from "@/lib/api";
import { getDict } from "@/lib/lang";
import { SELLER_ORDERS } from "@/lib/mock-data";
import { getSellerContext } from "@/lib/seller";

export default async function SellerOrders() {
  const { t } = await getDict();
  const ctx = await getSellerContext();
  // Дэлгүүргүй бол layout дэлгүүр нээх формыг харуулна
  if (ctx.mode === "live" && !ctx.slug) return null;
  const orders = ctx.mode === "live" ? await getSellerOrders(ctx.token) : SELLER_ORDERS;
  return (
    <>
      <h1 className="mb-7 font-serif text-[clamp(32px,4vw,44px)] leading-none font-medium">{t.orders}</h1>
      <OrdersTable orders={orders} live={ctx.mode === "live"} />
    </>
  );
}
