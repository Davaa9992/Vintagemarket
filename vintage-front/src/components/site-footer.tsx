import Link from "next/link";
import type { Dict } from "@/lib/i18n";
import { Wordmark } from "./wordmark";

export function SiteFooter({ t }: { t: Dict }) {
  const col = "flex flex-col gap-2.5 text-sm";
  const head = "text-xs font-bold tracking-[0.12em] text-gold uppercase";
  const a = "text-[#efe8da] hover:text-white";
  return (
    <footer className="mt-24 bg-ink text-[#e6ddcd]">
      <div className="container-vm grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 pt-16 pb-10">
        <div className="flex flex-col gap-3">
          <Wordmark size="sm" tone="dark" align="start" />
          <p className="max-w-[280px] text-sm leading-relaxed text-[#cfc4b2]">{t.footerAbout}</p>
        </div>
        <div className={col}>
          <strong className={head}>{t.footerShop}</strong>
          <Link href="/products" className={a}>{t.newIn}</Link>
          <Link href="/products" className={a}>{t.allCategories}</Link>
          <Link href="/shops" className={a}>{t.shops}</Link>
        </div>
        <div className={col}>
          <strong className={head}>{t.footerHelp}</strong>
          <Link href="/track" className={a}>{t.trackOrder}</Link>
          <Link href="/help#delivery" className={a}>{t.delivery}</Link>
          <Link href="/help#returns" className={a}>{t.returns}</Link>
          <Link href="/help#payment" className={a}>{t.payment}</Link>
          <Link href="/help#contact" className={a}>{t.contact}</Link>
        </div>
        <div className={col}>
          <strong className={head}>{t.footerSeller}</strong>
          <Link href="/seller" className={a}>{t.openShop}</Link>
          <Link href="/help#fees" className={a}>{t.feesAndPayouts}</Link>
          <Link href="/help#sell" className={a}>{t.howToSell}</Link>
        </div>
      </div>
      <div className="container-vm flex flex-wrap justify-between gap-4 border-t border-[#4a3d32] pt-5 pb-8 text-[13px] text-[#bfb3a0]">
        <span>© 2026 Vintage Mongolia</span>
        <span>Монгол / English · ₮ MNT</span>
      </div>
    </footer>
  );
}
