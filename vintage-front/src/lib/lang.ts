import "server-only";
import { cookies } from "next/headers";
import { DICTS, LANG_COOKIE, type Lang } from "./i18n";

/** Cookie-оос хэл унших (анхдагч: монгол) */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return v === "en" ? "en" : "mn";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: DICTS[lang] };
}
