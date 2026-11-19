"use client";
import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { DICTS, LANG_COOKIE, type Dict, type Lang } from "@/lib/i18n";

const LangContext = createContext<{ lang: Lang; t: Dict }>({ lang: "mn", t: DICTS.mn });

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={{ lang, t: DICTS[lang] }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

function setLangCookie(l: Lang) {
  document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

/** МН / EN солих товч */
export function LangSwitch() {
  const { lang } = useLang();
  const router = useRouter();
  const pick = (l: Lang) => {
    setLangCookie(l);
    router.refresh();
  };
  return (
    <div className="flex items-center gap-1 text-[13px]" role="group" aria-label="Хэл / Language">
      {(["mn", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-faint">/</span>}
          <button
            type="button"
            onClick={() => pick(l)}
            aria-pressed={lang === l}
            className={`min-h-9 cursor-pointer px-1 ${lang === l ? "font-bold" : "text-muted hover:text-olive"}`}
          >
            {l === "mn" ? "МН" : "EN"}
          </button>
        </span>
      ))}
    </div>
  );
}
