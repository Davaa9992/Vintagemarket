// Дэлгүүрийн үндсэн төрлүүд (front-end талын загвар)

/** Төлвийн зэрэглэл: A маш сайн, B сайн, C ул мөртэй, D засвартай */
export type Grade = "A" | "B" | "C" | "D";

export const CATEGORY_SLUGS = [
  "clothing",
  "accessories",
  "home",
  "collectibles",
  "antiques",
  "electronics",
  "media",
  "toys",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/** Он үеийн шүүлтүүр */
export const DECADES = ["old", "60", "70", "80", "90"] as const;
export type Decade = (typeof DECADES)[number];

export type ProductStatus = "available" | "reserved" | "sold" | "draft";

export interface Category {
  slug: CategorySlug;
  image: string;
}

export interface Seller {
  slug: string;
  name: string;
  initials: string;
  city: string;
  district?: string;
  focus: string;
  bio: string;
  since: string;
  listings: number;
  sold: number;
  rating: number;
}

export interface Measurement {
  label: string;
  cm: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CategorySlug;
  era: string;
  decade: Decade;
  grade: Grade;
  gradeNote?: string;
  price: number;
  /** Зураг: /items/*.svg бол чимэглэл, бусад нь бодит зураг */
  images: string[];
  /** Дэвсгэрийн өнгөний дугаар (0–3) */
  tone: number;
  seller: string;
  size?: string;
  material?: string;
  color?: string;
  measurements: Measurement[];
  status: ProductStatus;
  createdAt: string;
}

/** Худалдан авагчид харагдах захиалга */
export interface OrderView {
  code: string;
  createdAt: string;
  status: SellerOrderStatus;
  total: number;
  delivery: DeliveryMethod;
  items: { name: string; price: number; quantity: number; image?: string }[];
  shops: { name: string; status: SellerOrderStatus }[];
}

export interface SellerSummary {
  monthSales: number;
  monthCommission: number;
  monthPayout: number;
  monthOrders: number;
  toShip: number;
  activeListings: number;
  drafts: number;
}

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  role: "customer" | "seller" | "admin";
  shop?: { name: string; slug: string; initials: string; status: string };
}

export interface Review {
  seller: string;
  stars: number;
  text: string;
  who: string;
  item: string;
}

export type PaymentMethod = "qpay" | "cash";
export type DeliveryMethod = "ship" | "pickup";

export interface OrderInput {
  customer: { name: string; phone: string; address: string; note?: string };
  items: { product_id: string; quantity: number }[];
  payment_method: PaymentMethod;
  delivery: DeliveryMethod;
}

export interface OrderResult {
  code: string;
  demo: boolean;
}

export type SellerOrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface SellerOrder {
  /** Backend-ийн захиалгын _id (төлөв солиход). Жишээ өгөгдөлд байхгүй */
  ref?: string;
  id: string;
  items: string;
  buyer: string;
  total: number;
  status: SellerOrderStatus;
}

export interface ProductQuery {
  categories?: CategorySlug[];
  grades?: Grade[];
  decades?: Decade[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: "new" | "low" | "high";
  seller?: string;
}
