import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";
import { getSellers } from "@/lib/api";

export const metadata: Metadata = { title: "Сагс" };

export default async function CartPage() {
  const sellers = await getSellers();
  return <Checkout sellers={sellers} />;
}
