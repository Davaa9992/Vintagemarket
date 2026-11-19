import type { ReactNode } from "react";

/** GET форм: хайлт (+ нэмэлт шүүлтүүр) URL-д хадгалагдана */
export function SearchForm({ q, placeholder, label, children }: { q?: string; placeholder: string; label: string; children?: ReactNode }) {
  return (
    <form method="get" className="mb-5 flex flex-wrap items-center gap-2.5">
      <input className="field min-h-11 max-w-[320px] flex-[1_1_220px]" name="q" defaultValue={q} placeholder={placeholder} aria-label={placeholder} />
      {children}
      <button type="submit" className="btn-outline min-h-11">
        {label}
      </button>
    </form>
  );
}
