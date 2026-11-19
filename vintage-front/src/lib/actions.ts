"use server";
// Server actions: token-г httpOnly cookie-д хадгалж, backend-ийг server талаас дуудна.
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, apiFetch, hasBackend } from "./api";
import { getToken, TOKEN_COOKIE } from "./session";
import { CATEGORY_SLUGS, DECADES, type OrderInput } from "./types";

export interface FormState {
  error?: string;
  ok?: boolean;
}

const MONTH = 30 * 24 * 60 * 60;

/** Зөвхөн сайтын дотоод зам руу буцаана (open redirect-ээс сэргийлнэ) */
function safeNext(v: FormDataEntryValue | null): string {
  const s = String(v ?? "");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Сервертэй холбогдож чадсангүй");

/**
 * Backend-ийн rate limit жинхэнэ хэрэглэгчийн IP-г харах ёстой (эс бөгөөс бүгд Next server-ийн нэг IP болно).
 * Reverse proxy (Caddy)-ийн нэмсэн хамгийн сүүлийн X-Forwarded-For утгыг дамжуулна.
 */
async function clientIp(): Promise<Record<string, string>> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",").pop()?.trim() || h.get("x-real-ip") || "";
  return ip ? { "X-Forwarded-For": ip } : {};
}

const COOKIE_SECURE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production";

async function saveToken(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    path: "/",
    maxAge: MONTH,
  });
}

async function requireToken(): Promise<string> {
  const token = await getToken();
  if (!token) redirect("/login?next=/seller");
  return token;
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  if (!hasBackend) return { error: "Backend холбогдоогүй байна (NEXT_PUBLIC_API_URL)" };
  try {
    const data = await apiFetch<{ token: string }>("/user/login", {
      method: "POST",
      headers: await clientIp(),
      body: JSON.stringify({ login: String(form.get("phone") ?? "").trim(), password: String(form.get("password") ?? "") }),
    });
    await saveToken(data.token);
  } catch (e) {
    return { error: message(e) };
  }
  redirect(safeNext(form.get("next")));
}

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  if (!hasBackend) return { error: "Backend холбогдоогүй байна (NEXT_PUBLIC_API_URL)" };
  try {
    const data = await apiFetch<{ token: string }>("/user/sign_up", {
      method: "POST",
      headers: await clientIp(),
      body: JSON.stringify({
        full_name: String(form.get("name") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      }),
    });
    await saveToken(data.token);
  } catch (e) {
    return { error: message(e) };
  }
  redirect(safeNext(form.get("next")));
}

export async function logoutAction() {
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/");
}

export async function openShopAction(_: FormState, form: FormData): Promise<FormState> {
  const token = await requireToken();
  try {
    await apiFetch("/seller/shop", {
      method: "POST",
      token,
      body: JSON.stringify({
        name: String(form.get("name") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        district: String(form.get("district") ?? "").trim() || undefined,
        focus: String(form.get("focus") ?? "").trim() || undefined,
        bio: String(form.get("bio") ?? "").trim() || undefined,
      }),
    });
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/seller", "layout");
  redirect("/seller");
}

const num = (v: FormDataEntryValue | null) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Зураг: browser-оос base64 биш, File-ээр ирнэ. Backend руу биеэр нь урсгана */
async function uploadImage(token: string, file: File): Promise<string> {
  const data = await apiFetch<{ url: string }>(`/seller/upload/image?name=${encodeURIComponent(file.name || "photo.jpg")}`, {
    method: "POST",
    token,
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: await file.arrayBuffer(),
  });
  return data.url;
}

/** Формоос backend-ийн барааны бие үүсгэнэ (шинэ зургийг хуулна, хуучныг "keep"-ээр үлдээнэ) */
async function listingBody(token: string, form: FormData): Promise<{ body?: Record<string, unknown>; error?: string }> {
  const category = String(form.get("category"));
  const decade = String(form.get("era"));
  if (!(CATEGORY_SLUGS as readonly string[]).includes(category) || !(DECADES as readonly string[]).includes(decade)) {
    return { error: "Ангилал, он үеэ сонгоно уу" };
  }
  const categories = await apiFetch<{ _id: string; slug: string }[]>("/category");
  const category_id = categories.find((c) => c.slug === category)?._id;
  if (!category_id) return { error: "Ангилал олдсонгүй" };

  const keep = form.getAll("keep").map(String).filter(Boolean);
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const images = keep.slice(0, 8);
  for (const f of files.slice(0, 8 - images.length)) images.push(await uploadImage(token, f));

  let extra: { label: string; cm: number }[] = [];
  try {
    const parsed = JSON.parse(String(form.get("extra_measurements") ?? "[]"));
    if (Array.isArray(parsed)) extra = parsed.filter((m) => m && typeof m.label === "string" && typeof m.cm === "number");
  } catch {
    extra = [];
  }
  const dims = [
    ["Урт", form.get("length")],
    ["Өргөн", form.get("width")],
    ["Өндөр", form.get("height")],
  ]
    .map(([label, v]) => ({ label: String(label), cm: num(v as FormDataEntryValue | null) }))
    .filter((m): m is { label: string; cm: number } => m.cm !== undefined);

  return {
    body: {
      name: String(form.get("name") ?? "").trim(),
      category_id,
      decade,
      era: decade === "old" ? "1960-аас өмнө" : `19${decade}-аад он`,
      grade: String(form.get("grade") ?? "B"),
      price: Math.round(num(form.get("price")?.toString().replace(/\D/g, "") ?? null) ?? 0),
      description: String(form.get("description") ?? "").trim(),
      measurements: [...extra, ...dims].slice(0, 12),
      images,
      published: form.get("intent") === "draft" ? 0 : 1,
    },
  };
}

function revalidateListings() {
  revalidatePath("/seller", "layout");
  revalidatePath("/products", "layout");
  revalidatePath("/shops", "layout");
}

export async function createListingAction(_: FormState, form: FormData): Promise<FormState> {
  const token = await requireToken();
  try {
    const { body, error } = await listingBody(token, form);
    if (error) return { error };
    await apiFetch("/seller/product", { method: "POST", token, body: JSON.stringify({ ...body, quantity: 1 }) });
  } catch (e) {
    return { error: message(e) };
  }
  revalidateListings();
  return { ok: true };
}

export async function updateListingAction(id: string, form: FormData): Promise<FormState> {
  const token = await requireToken();
  try {
    const { body, error } = await listingBody(token, form);
    if (error) return { error };
    await apiFetch(`/seller/product/${encodeURIComponent(id)}`, { method: "PATCH", token, body: JSON.stringify(body) });
  } catch (e) {
    return { error: message(e) };
  }
  revalidateListings();
  return { ok: true };
}

export async function deleteListingAction(id: string): Promise<FormState> {
  const token = await requireToken();
  try {
    await apiFetch(`/seller/product/${encodeURIComponent(id)}`, { method: "DELETE", token });
  } catch (e) {
    return { error: message(e) };
  }
  revalidateListings();
  return { ok: true };
}

export async function markShippedAction(ref: string): Promise<FormState> {
  const token = await requireToken();
  try {
    await apiFetch(`/seller/order/${encodeURIComponent(ref)}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status: "shipped" }),
    });
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/seller", "layout");
  return { ok: true };
}

/** Захиалга: нэвтэрсэн бол token-той илгээж "Миний захиалга"-д холбоно */
export async function placeOrderAction(input: OrderInput): Promise<{ code?: string; error?: string }> {
  const token = await getToken();
  try {
    const data = await apiFetch<{ code: string }>("/order", {
      method: "POST",
      token,
      headers: await clientIp(),
      body: JSON.stringify({
        customer: { name: input.customer.name, phone: input.customer.phone, address: input.customer.address },
        items: input.items.slice(0, 50).map((i) => ({ product_id: String(i.product_id), quantity: Math.max(1, Math.floor(i.quantity)) })),
        payment_method: input.payment_method,
        delivery: input.delivery,
        note: input.customer.note || undefined,
      }),
    });
    revalidatePath("/products", "layout");
    return { code: data.code };
  } catch (e) {
    return { error: message(e) };
  }
}

// ---- Админ ----

async function adminPatch(path: string, body: unknown): Promise<FormState> {
  const token = await getToken();
  if (!token) return { error: "Нэвтэрнэ үү" };
  try {
    await apiFetch(path, { method: "PATCH", token, body: JSON.stringify(body) });
  } catch (e) {
    return { error: message(e) };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function adminOrderStatusAction(id: string, status: string): Promise<FormState> {
  return adminPatch(`/admin/order/${encodeURIComponent(id)}/status`, { status });
}

export async function adminShopStatusAction(id: string, status: string): Promise<FormState> {
  const res = await adminPatch(`/admin/shop/${encodeURIComponent(id)}/status`, { status });
  if (res.ok) {
    revalidatePath("/shops", "layout");
    revalidatePath("/products", "layout");
  }
  return res;
}

export async function adminUserBlockAction(id: string, blocked: string): Promise<FormState> {
  return adminPatch(`/admin/user/${encodeURIComponent(id)}/block`, { blocked: blocked === "1" ? 1 : 0 });
}
