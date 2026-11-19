"use client";
import { useState } from "react";
import { isIllustration } from "@/lib/format";
import { useLang } from "./lang-provider";
import { ProductArt } from "./product-art";

interface View {
  src: string;
  tone: number;
  zoom?: [number, number, number];
  label: string;
}

/** Зургийн цомог. Чимэглэл ганц зурагтай үед өөр өнцөг/томруулалт үүсгэнэ */
export function Gallery({ images, tone, name }: { images: string[]; tone: number; name: string }) {
  const { lang } = useLang();
  const L = lang === "mn" ? ["Урд тал", "Хажуу тал", "Ойроос", "Нарийн хэсэг"] : ["Front", "Side", "Close-up", "Detail"];
  const views: View[] =
    images.length === 1 && isIllustration(images[0])
      ? [
          { src: images[0], tone, label: L[0] },
          { src: images[0], tone: tone + 1, zoom: [20, 14, 60], label: L[1] },
          { src: images[0], tone: tone + 3, zoom: [-40, -20, 180], label: L[2] },
          { src: images[0], tone: tone + 2, zoom: [-45, -30, 190], label: L[3] },
        ]
      : images.map((src, i) => ({ src, tone, label: `${i + 1}` }));
  const [i, setI] = useState(0);
  const cur = views[i];

  return (
    <div className="flex flex-wrap-reverse gap-4">
      {views.length > 1 && (
        <div role="group" aria-label="Photos" className="flex flex-none flex-wrap gap-3 sm:flex-col">
          {views.map((v, k) => (
            <button
              key={k}
              type="button"
              aria-label={v.label}
              aria-pressed={k === i}
              onClick={() => setI(k)}
              className={`w-[84px] cursor-pointer border-2 ${k === i ? "border-ink" : "border-transparent"}`}
            >
              <ProductArt src={v.src} tone={v.tone} zoom={v.zoom} sizes="84px" />
            </button>
          ))}
        </div>
      )}
      <div className="relative min-w-0 flex-[1_1_320px]">
        <ProductArt src={cur.src} tone={cur.tone} zoom={cur.zoom} alt={`${name}, ${cur.label}`} sizes="(max-width: 768px) 100vw, 50vw" priority />
        <span className="absolute bottom-4 left-4 bg-cream px-2.5 py-1.5 text-xs font-semibold">
          {cur.label} · {i + 1}/{views.length}
        </span>
      </div>
    </div>
  );
}
