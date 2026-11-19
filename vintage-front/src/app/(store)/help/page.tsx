import type { Metadata } from "next";
import { getDict } from "@/lib/lang";
import { GRADE_NAMES } from "@/lib/i18n";

export const metadata: Metadata = { title: "Тусламж" };

export default async function HelpPage() {
  const { lang, t } = await getDict();
  const mn = lang === "mn";
  const sections: [string, string, string][] = [
    ["delivery", t.delivery, mn ? "Худалдагч бүр захиалгыг 2 ажлын өдөрт илгээнэ. Улаанбаатар дотор хаягаар хүргүүлэх эсвэл худалдагчаас очиж авах боломжтой. Орон нутаг руу унаагаар илгээнэ." : "Each seller ships within 2 working days. In Ulaanbaatar choose delivery or pick-up; provinces are sent by intercity transport."],
    ["returns", t.returns, t.shippingReturnsText],
    ["payment", t.payment, mn ? "QPay-ээр шууд, эсвэл бараагаа хүлээн авахдаа бэлнээр төлнө. QPay төлбөрийг бараа хүргэгдэх хүртэл Vintage Mongolia хадгална." : "Pay instantly with QPay or in cash on delivery. QPay payments are held by Vintage Mongolia until delivery."],
    ["fees", t.feesAndPayouts, mn ? "Дэлгүүр нээх, бараа байршуулах үнэгүй. Бараа зарагдсан үед 10% шимтгэл суутгаж, үлдэгдлийг хүргэлт баталгаажсаны дараа шилжүүлнэ." : "Opening a shop and listing are free. A 10% commission is taken when an item sells; the rest is paid out after delivery."],
    ["sell", t.howToSell, mn ? "Өдрийн гэрэлд олон өнцгөөс зураг авч, он үе, төлөв, хэмжээг сантиметрээр бичнэ үү." : "Photograph in daylight from several angles and give the era, condition and measurements in cm."],
    ["contact", t.contact, mn ? "Асуулт байвал сайтын доод хэсгийн холбоосоор бидэнтэй холбогдоно уу." : "Questions? Reach us through the links at the bottom of the site."],
  ];
  return (
    <div className="container-vm max-w-[860px] pt-10">
      <h1 className="mb-10 font-serif text-[clamp(40px,5vw,56px)] leading-none font-medium">{t.footerHelp}</h1>
      <section id="grades" className="mb-10 flex scroll-mt-6 flex-col gap-3 border-t border-ink pt-5">
        <h2 className="font-serif text-3xl font-medium">{t.condition}</h2>
        {(["A", "B", "C", "D"] as const).map((g) => (
          <p key={g} className="flex items-center gap-3.5 text-[15px]">
            <span className="inline-flex size-9 flex-none items-center justify-center border border-ink font-bold">{g}</span>
            <span>
              <strong>{GRADE_NAMES[lang][g].long}</strong> · {GRADE_NAMES[lang][g].desc}
            </span>
          </p>
        ))}
      </section>
      {sections.map(([id, title, text]) => (
        <section key={id} id={id} className="mb-10 flex scroll-mt-6 flex-col gap-3 border-t border-ink pt-5">
          <h2 className="font-serif text-3xl font-medium">{title}</h2>
          <p className="text-[15px] leading-[1.7] text-ink-2">{text}</p>
        </section>
      ))}
    </div>
  );
}
