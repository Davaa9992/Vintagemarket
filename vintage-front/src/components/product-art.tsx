import Image from "next/image";
import { cx, isIllustration, toneBackground } from "@/lib/format";

/**
 * Барааны зураг. Чимэглэл (svg) бол студийн хана/шалан дээр байрлуулна,
 * бодит зураг бол дүүргэж харуулна.
 */
export function ProductArt({
  src,
  tone = 0,
  alt = "",
  className,
  ratio = "aspect-[4/5]",
  sizes = "(max-width: 640px) 50vw, 25vw",
  priority,
  zoom,
}: {
  src: string;
  tone?: number;
  alt?: string;
  className?: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  /** чимэглэлийн томруулалт: [left%, top%, width%] */
  zoom?: [number, number, number];
}) {
  if (!isIllustration(src)) {
    return (
      <span className={cx("relative block overflow-hidden bg-paper", ratio, className)}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} unoptimized />
      </span>
    );
  }
  const [l, t, w] = zoom ?? [14, 12, 72];
  return (
    <span className={cx("relative block overflow-hidden", ratio, className)} style={{ background: toneBackground(tone) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute object-contain"
        style={zoom ? { left: `${l}%`, top: `${t}%`, width: `${w}%` } : { left: "14%", top: "12%", width: "72%", height: "80%" }}
      />
    </span>
  );
}
