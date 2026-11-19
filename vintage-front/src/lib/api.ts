// Backend-тэй харилцах давхарга.
// NEXT_PUBLIC_API_URL (жишээ нь http://localhost:5000/v1) тохируулаагүй бол жишээ өгөгдөл ашиглана.
// API_SERVER_URL: server талаас дуудах дотоод хаяг (Docker-т http://back:5000/v1). Хоосон бол NEXT_PUBLIC_API_URL.
import { unstable_rethrow } from "next/navigation";
import { CATEGORIES, PRODUCTS, REVIEWS, SELLERS } from "./mock-data";
import type {
  Category,
  CategorySlug,
  Decade,
  Grade,
  OrderResult,
  OrderView,
  Product,
  ProductQuery,
  Review,
  Seller,
  SellerOrder,
  SellerOrderStatus,
  SellerSummary,
} from "./types";
import { CATEGORY_SLUGS, DECADES } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
export const hasBackend = API_URL.length > 0;
const SERVER_URL = (process.env.API_SERVER_URL || "").replace(/\/$/, "") || API_URL;

/** Server дээр дотоод хаяг, browser дээр нийтийн хаяг */
export const apiBase = () => (typeof window === "undefined" ? SERVER_URL : API_URL);

export interface ApiEnvelope<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

/** Backend дуудах. token өгвөл Bearer-ээр илгээнэ */
export async function apiFetch<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${apiBase()}${path}`, {
    cache: "no-store",
    ...rest,
    headers: {
      ...(rest.body && !(rest.body instanceof Blob) && !(rest.body instanceof ArrayBuffer) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const body = (await res.json().catch(() => ({}))) as Partial<ApiEnvelope<T>>;
  if (!res.ok || body.status !== "success") throw new ApiError(body.message || `API ${res.status}`, res.status);
  return body.data as T;
}

const apiGet = <T>(path: string) => apiFetch<T>(path);

// ---- Backend → front-end загвар руу хөрвүүлэх ----

export interface BackendShop {
  _id: string;
  name: string;
  slug: string;
  initials?: string;
  city?: string;
  district?: string;
  focus?: string;
  bio?: string;
  sold_count?: number;
  rating?: number;
  listing_count?: number;
  createdAt?: string;
}

export interface BackendProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category_id?: { slug?: string } | string;
  shop_id?: BackendShop | string;
  price: number;
  size?: string;
  era?: string;
  decade?: string;
  grade?: string;
  grade_note?: string;
  material?: string;
  color?: string;
  measurements?: { label: string; cm: number }[];
  images?: string[];
  status?: "available" | "reserved" | "sold";
  published?: number;
  createdAt?: string;
}

/** /items/*.svg нь front-end-ийн чимэглэл тул хэвээр, бусад нь backend-ийн зураг */
function imageUrl(src: string): string {
  if (/^https?:\/\//.test(src) || src.startsWith("/items/")) return src;
  const origin = API_URL.replace(/\/v\d+$/, "");
  return `${origin}${src.startsWith("/") ? "" : "/"}${src}`;
}

const GRADES: readonly string[] = ["A", "B", "C", "D"];

export function mapProduct(p: BackendProduct, i = 0): Product {
  const catSlug = typeof p.category_id === "object" ? p.category_id?.slug : undefined;
  const category = (CATEGORY_SLUGS as readonly string[]).includes(catSlug ?? "") ? (catSlug as CategorySlug) : "clothing";
  const shop = typeof p.shop_id === "object" ? p.shop_id : undefined;
  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    gradeNote: p.grade_note || undefined,
    category,
    era: p.era ?? "",
    decade: (DECADES as readonly string[]).includes(p.decade ?? "") ? (p.decade as Decade) : "old",
    grade: GRADES.includes(p.grade ?? "") ? (p.grade as Grade) : "B",
    price: p.price,
    images: p.images?.length ? p.images.map(imageUrl) : ["/items/deel.svg"],
    tone: i % 4,
    seller: shop?.slug ?? "",
    size: p.size || undefined,
    material: p.material || undefined,
    color: p.color || undefined,
    measurements: p.measurements ?? [],
    status: p.published === 0 ? "draft" : (p.status ?? "available"),
    createdAt: p.createdAt ?? new Date().toISOString(),
  };
}

function mapShop(s: BackendShop): Seller {
  return {
    slug: s.slug,
    name: s.name,
    initials: s.initials ?? s.name.slice(0, 2).toUpperCase(),
    city: s.city ?? "",
    district: s.district || undefined,
    focus: s.focus ?? "",
    bio: s.bio ?? "",
    since: s.createdAt ? String(new Date(s.createdAt).getFullYear()) : "",
    listings: s.listing_count ?? 0,
    sold: s.sold_count ?? 0,
    rating: s.rating ?? 0,
  };
}

// ---- Шүүлт ----

export function filterProducts(list: Product[], q: ProductQuery): Product[] {
  const needle = q.q?.trim().toLowerCase();
  let out = list.filter(
    (p) =>
      p.status !== "draft" &&
      (!q.categories?.length || q.categories.includes(p.category)) &&
      (!q.grades?.length || q.grades.includes(p.grade)) &&
      (!q.decades?.length || q.decades.includes(p.decade)) &&
      (q.minPrice === undefined || p.price >= q.minPrice) &&
      (q.maxPrice === undefined || p.price <= q.maxPrice) &&
      (!q.seller || p.seller === q.seller) &&
      (!needle || `${p.name} ${p.era} ${p.description}`.toLowerCase().includes(needle)),
  );
  if (q.sort === "low") out = [...out].sort((a, b) => a.price - b.price);
  else if (q.sort === "high") out = [...out].sort((a, b) => b.price - a.price);
  else out = [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return out;
}

function toSearch(q: ProductQuery): string {
  const s = new URLSearchParams({ limit: "100" });
  if (q.categories?.length) s.set("category", q.categories.join(","));
  if (q.grades?.length) s.set("grade", q.grades.join(","));
  if (q.decades?.length) s.set("era", q.decades.join(","));
  if (q.seller) s.set("shop", q.seller);
  if (q.q?.trim()) s.set("search", q.q.trim());
  if (q.minPrice !== undefined) s.set("min_price", String(q.minPrice));
  if (q.maxPrice !== undefined) s.set("max_price", String(q.maxPrice));
  s.set("sort", q.sort === "low" ? "price_asc" : q.sort === "high" ? "price_desc" : "newest");
  return s.toString();
}

// ---- Нийтийн функцууд ----

export async function getProducts(q: ProductQuery = {}): Promise<Product[]> {
  if (!hasBackend) return filterProducts(PRODUCTS, q);
  try {
    const items = await apiGet<BackendProduct[]>(`/product?${toSearch(q)}`);
    return items.map(mapProduct);
  } catch (e) {
    // Next.js-ийн dynamic/redirect дохиог залгихгүй
    unstable_rethrow(e);
    console.error("[api] products:", e);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!hasBackend) return PRODUCTS.find((p) => p.slug === slug);
  try {
    return mapProduct(await apiGet<BackendProduct>(`/product/${encodeURIComponent(slug)}`));
  } catch (e) {
    // Next.js-ийн dynamic/redirect дохиог залгихгүй
    unstable_rethrow(e);
    if (!(e instanceof ApiError && e.statusCode === 404)) console.error("[api] product:", e);
    return undefined;
  }
}

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getSellers(): Promise<Seller[]> {
  if (!hasBackend) return SELLERS;
  try {
    return (await apiGet<BackendShop[]>("/shop")).map(mapShop);
  } catch (e) {
    // Next.js-ийн dynamic/redirect дохиог залгихгүй
    unstable_rethrow(e);
    console.error("[api] shops:", e);
    return [];
  }
}

export async function getSeller(slug: string): Promise<Seller | undefined> {
  if (!slug) return undefined;
  if (!hasBackend) return SELLERS.find((s) => s.slug === slug);
  try {
    return mapShop(await apiGet<BackendShop>(`/shop/${encodeURIComponent(slug)}`));
  } catch (e) {
    // Next.js-ийн dynamic/redirect дохиог залгихгүй
    unstable_rethrow(e);
    if (!(e instanceof ApiError && e.statusCode === 404)) console.error("[api] shop:", e);
    return undefined;
  }
}

/** Сэтгэгдэл backend-д хараахан байхгүй тул жишээ */
export async function getReviews(seller: string): Promise<Review[]> {
  return REVIEWS.filter((r) => r.seller === seller);
}

// ---- Худалдагчийн самбар (token шаардлагатай, server талаас) ----

interface BackendShopOrder {
  _id: string;
  code: string;
  customer?: { name?: string };
  items: { name: string }[];
  subtotal: number;
  status: SellerOrderStatus;
}

export async function getSellerOrders(token: string, limit = 50): Promise<SellerOrder[]> {
  const items = await apiFetch<BackendShopOrder[]>(`/seller/order?limit=${limit}`, { token });
  return items.map((o) => ({
    ref: o._id,
    id: o.code,
    items: o.items.map((i) => i.name).join(", "),
    buyer: o.customer?.name ?? "",
    total: o.subtotal,
    status: o.status,
  }));
}

export async function getSellerProducts(token: string): Promise<Product[]> {
  return (await apiFetch<BackendProduct[]>("/seller/product?limit=100", { token })).map(mapProduct);
}

export async function getSellerProduct(token: string, id: string): Promise<Product | undefined> {
  try {
    return mapProduct(await apiFetch<BackendProduct>(`/seller/product/${encodeURIComponent(id)}`, { token }));
  } catch (e) {
    // Next.js-ийн dynamic/redirect дохиог залгихгүй
    unstable_rethrow(e);
    if (e instanceof ApiError && (e.statusCode === 404 || e.statusCode === 400)) return undefined;
    throw e;
  }
}

export async function getSellerSummary(token: string): Promise<SellerSummary> {
  const s = await apiFetch<Record<string, number>>("/seller/summary", { token });
  return {
    monthSales: s.month_sales,
    monthCommission: s.month_commission,
    monthPayout: s.month_payout,
    monthOrders: s.month_orders,
    toShip: s.to_ship,
    activeListings: s.active_listings,
    drafts: s.drafts,
  };
}

// ---- Худалдан авагчийн захиалга ----

interface BackendOrder {
  code: string;
  createdAt: string;
  status: SellerOrderStatus;
  total: number;
  delivery?: "ship" | "pickup";
  items: { name: string; price: number; quantity: number; image?: string }[];
  shops?: { shop_name: string; status: SellerOrderStatus }[];
}

/** Ерөнхий захиалгын "completed" нь худалдан авагчид "хүргэгдсэн" */
const buyerStatus = (s: string): SellerOrderStatus => (s === "completed" ? "delivered" : (s as SellerOrderStatus));

const mapOrder = (o: BackendOrder): OrderView => ({
  code: o.code,
  createdAt: o.createdAt,
  status: buyerStatus(o.status),
  total: o.total,
  delivery: o.delivery ?? "ship",
  items: o.items.map((i) => ({ ...i, image: i.image ? imageUrl(i.image) : undefined })),
  shops: (o.shops ?? []).map((s) => ({ name: s.shop_name, status: buyerStatus(s.status) })),
});

/** Захиалгын дугаар + утсаар (нэвтрээгүй ч болно) */
export async function trackOrder(code: string, phone: string): Promise<OrderView | undefined> {
  if (!hasBackend) return undefined;
  try {
    const q = new URLSearchParams({ code, phone });
    return mapOrder(await apiGet<BackendOrder>(`/order/track?${q}`));
  } catch (e) {
    // Next.js-ийн dynamic/redirect дохиог залгихгүй
    unstable_rethrow(e);
    if (e instanceof ApiError && (e.statusCode === 404 || e.statusCode === 400)) return undefined;
    throw e;
  }
}

export async function getMyOrders(token: string): Promise<OrderView[]> {
  return (await apiFetch<BackendOrder[]>("/order/my?limit=50", { token })).map(mapOrder);
}

/** Backend байхгүй үеийн жишээ захиалга (browser-оос). Backend-тэй үед lib/actions.ts placeOrderAction */
export function demoOrder(): OrderResult {
  const d = new Date();
  const code = `VM-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(
    2,
    "0",
  )}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  return { code, demo: true };
}

// ---- Админ (token шаардлагатай, server талаас) ----

export type AdminOrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";
export const ADMIN_ORDER_STATUSES: AdminOrderStatus[] = ["pending", "paid", "shipped", "completed", "cancelled"];

export interface AdminOrder {
  id: string;
  code: string;
  createdAt: string;
  status: AdminOrderStatus;
  total: number;
  customer: { name: string; phone: string; address: string };
  payment: string;
  delivery: string;
  shops: { name: string; status: SellerOrderStatus }[];
  items: string;
}

export interface AdminSummary {
  byStatus: Partial<Record<AdminOrderStatus, number>>;
  revenue: number;
  commission: number;
}

export interface AdminShop {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: "active" | "paused" | "blocked";
  owner: string;
  phone: string;
  listings: number;
  sold: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  blocked: boolean;
  createdAt: string;
}

export async function getAdminSummary(token: string): Promise<AdminSummary> {
  const s = await apiFetch<{ by_status: AdminSummary["byStatus"]; revenue: number; commission: number }>("/admin/order/summary", { token });
  return { byStatus: s.by_status ?? {}, revenue: s.revenue ?? 0, commission: s.commission ?? 0 };
}

export async function getAdminOrders(token: string, q: { status?: string; search?: string } = {}): Promise<AdminOrder[]> {
  const s = new URLSearchParams({ limit: "100" });
  if (q.status) s.set("status", q.status);
  if (q.search) s.set("search", q.search);
  const items = await apiFetch<
    (BackendOrder & {
      _id: string;
      customer: AdminOrder["customer"];
      payment_method: string;
      status: AdminOrderStatus;
    })[]
  >(`/admin/order?${s}`, { token });
  return items.map((o) => ({
    id: o._id,
    code: o.code,
    createdAt: o.createdAt,
    status: o.status,
    total: o.total,
    customer: o.customer,
    payment: o.payment_method,
    delivery: o.delivery ?? "ship",
    shops: (o.shops ?? []).map((x) => ({ name: x.shop_name, status: x.status })),
    items: o.items.map((i) => i.name).join(", "),
  }));
}

export async function getAdminShops(token: string, search?: string): Promise<AdminShop[]> {
  const items = await apiFetch<
    (BackendShop & { status: AdminShop["status"]; owner_id?: { full_name?: string; phone?: string } })[]
  >(`/admin/shop${search ? `?search=${encodeURIComponent(search)}` : ""}`, { token });
  return items.map((x) => ({
    id: x._id,
    name: x.name,
    slug: x.slug,
    city: x.city ?? "",
    status: x.status,
    owner: x.owner_id?.full_name ?? "",
    phone: x.owner_id?.phone ?? "",
    listings: x.listing_count ?? 0,
    sold: x.sold_count ?? 0,
    createdAt: x.createdAt ?? "",
  }));
}

export async function getAdminUsers(token: string, search?: string): Promise<AdminUser[]> {
  const s = new URLSearchParams({ limit: "100" });
  if (search) s.set("search", search);
  const items = await apiFetch<{ _id: string; full_name: string; phone: string; role: string; blocked?: number; createdAt: string }[]>(
    `/admin/user?${s}`,
    { token },
  );
  return items.map((u) => ({ id: u._id, name: u.full_name, phone: u.phone, role: u.role, blocked: u.blocked === 1, createdAt: u.createdAt }));
}
