import type { Metadata } from "next";
import { OrderCard } from "@/components/order-card";
import { hasBackend, trackOrder } from "@/lib/api";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = { title: "Захиалга шалгах" };

type Search = Promise<{ code?: string; phone?: string }>;

export default async function TrackPage({ searchParams }: { searchParams: Search }) {
  const { lang, t } = await getDict();
  const { code = "", phone = "" } = await searchParams;
  const asked = Boolean(code.trim() && phone.trim());
  const order = asked ? await trackOrder(code.trim().slice(0, 40), phone.trim().slice(0, 20)) : undefined;
  return (
    <div className="container-vm flex justify-center pt-14 pb-10">
      <div className="flex w-full max-w-[640px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-5xl font-medium">{t.trackOrder}</h1>
          <p className="text-[15px] text-ink-2">{t.trackIntro}</p>
        </div>
        {!hasBackend && <p className="bg-paper px-4 py-3 text-sm text-ink-2">{t.trackNeedsBackend}</p>}
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="label flex-[1_1_200px]">
            {t.orderCodeLabel}
            <input className="field uppercase" name="code" defaultValue={code} required placeholder="V1A2B3C4D" />
          </label>
          <label className="label flex-[1_1_160px]">
            {t.phone}
            <input className="field" name="phone" type="tel" inputMode="tel" defaultValue={phone} required />
          </label>
          <button type="submit" className="btn-primary">
            {t.check}
          </button>
        </form>
        {asked && hasBackend && !order && (
          <p role="alert" className="bg-brick-soft px-4 py-3 text-sm font-semibold text-brick-ink">
            {t.orderNotFound}
          </p>
        )}
        {order && <OrderCard o={order} t={t} lang={lang} />}
      </div>
    </div>
  );
}
