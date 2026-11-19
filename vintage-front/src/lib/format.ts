/** 280000 → "280,000₮" */
export function formatMNT(n: number): string {
  return `${Math.round(n).toLocaleString("en-US")}₮`;
}

/** Шимтгэлийн хувь (blueprint: 10%) */
export const COMMISSION = 0.1;

/** Нэг дэлгүүрийн хүргэлтийн үнэ (жишээ, backend-ээс ирэх ёстой) */
export const DELIVERY_FEE = 6000;

/** Чимэглэл зураг эсэх (/items/*.svg) */
export function isIllustration(src: string): boolean {
  return src.startsWith("/items/");
}

const TONES: [string, string][] = [
  ["#E6DCCB", "#D5C6AD"],
  ["#E2D6C2", "#CDBDA2"],
  ["#EAE2D4", "#D9CCB6"],
  ["#DED3C0", "#C9B99D"],
];

/** Студийн хана + шалны хоёр өнгөт дэвсгэр */
export function toneBackground(tone: number, split = 74): string {
  const [wall, floor] = TONES[((tone % 4) + 4) % 4];
  return `linear-gradient(${wall} 0 ${split}%, ${floor} ${split}% 100%)`;
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
