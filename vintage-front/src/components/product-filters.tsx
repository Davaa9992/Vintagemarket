"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORY_NAMES, DECADE_NAMES, GRADE_NAMES } from "@/lib/i18n";
import { CATEGORY_SLUGS, DECADES, type CategorySlug } from "@/lib/types";
import { formatMNT } from "@/lib/format";
import { CloseIcon, SearchIcon } from "./icons";
import { useLang } from "./lang-provider";

const GRADES = ["A", "B", "C", "D"] as const;

/** URL-ийн шүүлтүүрийн параметрүүдийг унших, өөрчлөх */
function useParams() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const get = (k: string) => (sp.get(k) ?? "").split(",").filter(Boolean);
  const push = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(sp.toString());
    mut(next);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const toggle = (k: string, v: string) =>
    push((p) => {
      const cur = (p.get(k) ?? "").split(",").filter(Boolean);
      const nextVals = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
      if (nextVals.length) p.set(k, nextVals.join(","));
      else p.delete(k);
    });
  return { sp, get, push, toggle };
}

export function ProductFilters({ counts }: { counts: Record<CategorySlug, number> }) {
  const { lang, t } = useLang();
  const { sp, get, push, toggle } = useParams();
  const [open, setOpen] = useState(false);
  const cats = get("category");
  const grades = get("grade");
  const eras = get("era");
  const fs = "flex flex-col gap-1 border-t border-line py-4";
  const legend = "float-left w-full pb-2.5 text-sm font-bold";
  const ck = "flex min-h-9 cursor-pointer items-center gap-2.5 text-sm";
  const box = "size-[18px] accent-olive";

  const applyPrice = (fd: FormData) =>
    push((p) => {
      for (const k of ["min", "max"]) {
        const v = String(fd.get(k) ?? "").replace(/\D/g, "");
        if (v) p.set(k, v);
        else p.delete(k);
      }
    });

  return (
    <aside aria-label={t.filters} className="w-full md:w-auto md:max-w-[300px] md:min-w-[240px] md:flex-[1_1_240px]">
      <div className="flex items-center justify-between pb-3.5">
        <button
          type="button"
          className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-bold md:pointer-events-none"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {t.filters}
          <span className="md:hidden" aria-hidden>
            {open ? "–" : "+"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => push((p) => ["category", "grade", "era", "min", "max", "q"].forEach((k) => p.delete(k)))}
          className="min-h-11 cursor-pointer text-[13px] font-semibold text-olive underline"
        >
          {t.clear}
        </button>
      </div>
      <div className={open ? "block" : "hidden md:block"}>
        <fieldset className={fs}>
          <legend className={legend}>{t.categories}</legend>
          {CATEGORY_SLUGS.map((c) => (
            <label key={c} className={ck}>
              <input type="checkbox" className={box} checked={cats.includes(c)} onChange={() => toggle("category", c)} />
              <span className="flex-1">{CATEGORY_NAMES[lang][c]}</span>
              <span className="text-[13px] text-faint">{counts[c]}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className={fs}>
          <legend className={legend}>{t.condition}</legend>
          {GRADES.map((g) => (
            <label key={g} className={ck}>
              <input type="checkbox" className={box} checked={grades.includes(g)} onChange={() => toggle("grade", g)} />
              <span className="inline-flex size-[26px] items-center justify-center border border-ink text-[13px] font-bold">{g}</span>
              <span>{GRADE_NAMES[lang][g].long}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className={fs}>
          <legend className={legend}>{t.era}</legend>
          <div className="flex flex-wrap gap-2">
            {DECADES.map((d) => {
              const on = eras.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle("era", d)}
                  className={`min-h-9 cursor-pointer rounded-full border border-ink px-3.5 text-[13px] font-semibold ${
                    on ? "bg-ink text-cream" : "hover:bg-paper"
                  }`}
                >
                  {DECADE_NAMES[lang][d]}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className={fs}>
          <legend className={legend}>{t.price}</legend>
          <form action={applyPrice} className="flex flex-col gap-2.5" key={`${sp.get("min")}-${sp.get("max")}`}>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <span className="sr-only">{t.priceMin}</span>
                <input name="min" inputMode="numeric" placeholder={t.priceMin} defaultValue={sp.get("min") ?? ""} className="field" />
              </label>
              <span aria-hidden>–</span>
              <label className="flex-1">
                <span className="sr-only">{t.priceMax}</span>
                <input name="max" inputMode="numeric" placeholder={t.priceMax} defaultValue={sp.get("max") ?? ""} className="field" />
              </label>
            </div>
            <button type="submit" className="btn-outline min-h-11">
              {t.apply}
            </button>
          </form>
        </fieldset>
      </div>
    </aside>
  );
}

export function ActiveChips() {
  const { lang, t } = useLang();
  const { sp, get, push, toggle } = useParams();
  const chips: { label: string; remove: () => void }[] = [
    ...get("category")
      .filter((c): c is CategorySlug => (CATEGORY_SLUGS as readonly string[]).includes(c))
      .map((c) => ({ label: CATEGORY_NAMES[lang][c], remove: () => toggle("category", c) })),
    ...get("grade")
      .filter((g): g is (typeof GRADES)[number] => (GRADES as readonly string[]).includes(g))
      .map((g) => ({ label: `${g} · ${GRADE_NAMES[lang][g].short}`, remove: () => toggle("grade", g) })),
    ...get("era")
      .filter((d): d is (typeof DECADES)[number] => (DECADES as readonly string[]).includes(d))
      .map((d) => ({ label: DECADE_NAMES[lang][d], remove: () => toggle("era", d) })),
  ];
  const min = sp.get("min");
  const max = sp.get("max");
  if (min || max)
    chips.push({
      label: `${min ? formatMNT(+min) : "0₮"} – ${max ? formatMNT(+max) : "∞"}`,
      remove: () => push((p) => (p.delete("min"), p.delete("max"))),
    });
  const q = sp.get("q");
  if (q) chips.push({ label: `“${q}”`, remove: () => push((p) => p.delete("q")) });
  if (!chips.length) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.remove}
          aria-label={`${t.remove}: ${c.label}`}
          className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-[2px] bg-paper px-3 text-[13px] font-semibold hover:bg-line"
        >
          {c.label}
          <CloseIcon />
        </button>
      ))}
    </div>
  );
}

export function SortSelect() {
  const { t } = useLang();
  const { sp, push } = useParams();
  return (
    <label className="flex items-center gap-2.5 text-sm font-semibold">
      <span className="hidden sm:inline">{t.sortBy}</span>
      <select
        className="field w-auto min-w-[190px]"
        aria-label={t.sortBy}
        value={sp.get("sort") ?? "new"}
        onChange={(e) => push((p) => (e.target.value === "new" ? p.delete("sort") : p.set("sort", e.target.value)))}
      >
        <option value="new">{t.sortNew}</option>
        <option value="low">{t.sortLow}</option>
        <option value="high">{t.sortHigh}</option>
      </select>
    </label>
  );
}

export function SearchBox() {
  const { t } = useLang();
  const { sp, push } = useParams();
  return (
    <form
      role="search"
      key={sp.get("q") ?? ""}
      action={(fd) =>
        push((p) => {
          const v = String(fd.get("q") ?? "").trim();
          if (v) p.set("q", v);
          else p.delete("q");
        })
      }
      className="relative"
    >
      <label>
        <span className="sr-only">{t.search}</span>
        <input name="q" type="search" defaultValue={sp.get("q") ?? ""} placeholder={t.searchPlaceholder} className="field w-[min(280px,80vw)] pr-11" />
      </label>
      <button type="submit" aria-label={t.search} className="absolute top-0 right-0 inline-flex size-12 cursor-pointer items-center justify-center">
        <SearchIcon />
      </button>
    </form>
  );
}
