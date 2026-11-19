// Жишээ өгөгдөл. Backend (NEXT_PUBLIC_API_URL) холбогдоогүй үед ашиглагдана.
import type { Category, Product, Review, Seller, SellerOrder } from "./types";

export const CATEGORIES: Category[] = [
  { slug: "clothing", image: "/items/deel.svg" },
  { slug: "accessories", image: "/items/bag.svg" },
  { slug: "home", image: "/items/chair.svg" },
  { slug: "collectibles", image: "/items/stamps.svg" },
  { slug: "antiques", image: "/items/snuff.svg" },
  { slug: "electronics", image: "/items/camera.svg" },
  { slug: "media", image: "/items/record.svg" },
  { slug: "toys", image: "/items/car.svg" },
];

export const SELLERS: Seller[] = [
  {
    slug: "hadgalsan-tsag",
    name: "Хадгалсан Цаг",
    initials: "ХЦ",
    city: "Улаанбаатар",
    district: "Сүхбаатар дүүрэг",
    focus: "хувцас, гоёл",
    bio: "Бид 1950–90-ээд оны монгол хувцас, гоёл чимэглэл, гэр ахуйн эд зүйлсийг цуглуулж, цэвэрлэн засаад зардаг. Бараа бүрийг өдрийн гэрэлд зурагдаж, хэмжээг нь гараар хэмжинэ.",
    since: "2026",
    listings: 24,
    sold: 112,
    rating: 4.9,
  },
  {
    slug: "goviin-avdar",
    name: "Говийн Авдар",
    initials: "ГА",
    city: "Даланзадгад",
    focus: "эртний эдлэл",
    bio: "Говийн айлуудаас цуглуулсан авдар, хөөрөг, зэс гуулин эдлэл.",
    since: "2026",
    listings: 15,
    sold: 41,
    rating: 4.8,
  },
  {
    slug: "retro-khoroolol",
    name: "Ретро Хороолол",
    initials: "РХ",
    city: "Улаанбаатар",
    district: "Баянзүрх дүүрэг",
    focus: "электроник, пянз",
    bio: "Зөвлөлтийн үеийн радио, фотоаппарат, пянз. Бүгдийг ажиллагааг нь шалгаж зарна.",
    since: "2026",
    listings: 31,
    sold: 87,
    rating: 4.7,
  },
  {
    slug: "hangain-huuchin",
    name: "Хангайн Хуучин",
    initials: "ХХ",
    city: "Хархорин",
    focus: "тоглоом, цуглуулга",
    bio: "Хүүхэд насны тоглоом, марк, тэмдэг, дурсгалын зүйлс.",
    since: "2026",
    listings: 19,
    sold: 33,
    rating: 4.9,
  },
];

type Row = [string, string, Product["category"], Product["era"], Product["decade"], number, Product["grade"], string];

const ROWS: Row[] = [
  ["deel", "Ноосон дээл, торгон бүстэй", "clothing", "1970-аад он", "70", 280000, "A", "hadgalsan-tsag"],
  ["chest", "Будгаар чимсэн модон авдар", "home", "1950-аад он", "old", 1200000, "B", "goviin-avdar"],
  ["camera", "«Зенит-Е» хальсан аппарат", "electronics", "1970-аад он", "70", 185000, "A", "retro-khoroolol"],
  ["bracelet", "Мөнгөн бугуйвч, оюу шүрэнтэй", "accessories", "1960-аад он", "60", 260000, "A", "hadgalsan-tsag"],
  ["snuff", "Хаш хөөрөг, шүрэн таглаатай", "antiques", "XIX зууны сүүл", "old", 650000, "B", "goviin-avdar"],
  ["record", "Ардын дууны пянз", "media", "1960-аад он", "60", 35000, "C", "retro-khoroolol"],
  ["denim", "Жинсэн хүрэм", "clothing", "1990-ээд он", "90", 120000, "A", "hadgalsan-tsag"],
  ["chair", "Хилэн түшлэгтэй сандал", "home", "1970-аад он", "70", 380000, "B", "hadgalsan-tsag"],
  ["jug", "Зэс домбо, гуулин бүстэй", "antiques", "XX зууны эх", "old", 420000, "B", "goviin-avdar"],
  ["radio", "Модон хайрцагтай радио", "electronics", "1960-аад он", "60", 160000, "C", "retro-khoroolol"],
  ["bag", "Арьсан гар цүнх", "accessories", "1980-аад он", "80", 145000, "B", "hadgalsan-tsag"],
  ["car", "Тугалган тоглоом машин", "toys", "1970-аад он", "70", 48000, "C", "hangain-huuchin"],
  ["stamps", "Шуудангийн маркийн цомог", "collectibles", "1960–80-аад он", "60", 95000, "B", "hangain-huuchin"],
];

const DETAILS: Record<string, Partial<Product>> = {
  deel: {
    description:
      "Хар ногоон торгон бүстэй, тоосгон улаан ноосон дээл. Энгэр нь алтан шаргал утсаар хөвөөлсөн, гар оёдолтой. Дотор талдаа хөвөн доторлогоотой, намар болон хаврын улиралд өмсөхөд тохиромжтой.",
    gradeNote: "Урагдал, толбо, хорхойн идэлт байхгүй. Бүсний үзүүрт өнгө бага зэрэг гандсан. Худалдагч хими цэвэрлэгээнд оруулсан.",
    size: "M · 48",
    material: "Ноос, торго",
    color: "Тоосгон улаан",
    measurements: [
      { label: "Нийт урт", cm: 128 },
      { label: "Мөрний өргөн", cm: 46 },
      { label: "Цээж (хавтгайгаар)", cm: 54 },
      { label: "Ханцуйн урт", cm: 62 },
    ],
  },
  chest: {
    description: "Улаан суурьтай, алтан хээгээр будаж чимсэн модон авдар. Түгжээ нь бүтэн, дотор тал цэвэр.",
    material: "Нарс мод, будаг",
    measurements: [
      { label: "Өргөн", cm: 92 },
      { label: "Гүн", cm: 48 },
      { label: "Өндөр", cm: 56 },
    ],
  },
  camera: {
    description: "Хальсан толин аппарат, Helios-44 линзтэй. Хөшиг, гэрэл хэмжигч ажиллаж байгаа.",
    material: "Метал",
    measurements: [
      { label: "Өргөн", cm: 15 },
      { label: "Өндөр", cm: 10 },
    ],
  },
};

const DEFAULT_DESC = "Худалдагч төлөв, хэмжээг шалгаж бичсэн. Нэмэлт зураг хэрэгтэй бол худалдагчаас асуугаарай.";

export const PRODUCTS: Product[] = ROWS.map((r, i) => {
  const [img, name, category, era, decade, price, grade, seller] = r;
  const d = DETAILS[img] ?? {};
  return {
    id: `p${String(i + 1).padStart(3, "0")}`,
    slug: img,
    name,
    description: d.description ?? DEFAULT_DESC,
    gradeNote: d.gradeNote,
    category,
    era,
    decade,
    grade,
    price,
    images: [`/items/${img}.svg`],
    tone: i,
    seller,
    size: d.size,
    material: d.material,
    color: d.color,
    measurements: d.measurements ?? [],
    status: "available",
    createdAt: new Date(Date.UTC(2026, 10, 18 - i)).toISOString(),
  };
});

export const REVIEWS: Review[] = [
  { seller: "hadgalsan-tsag", stars: 5, text: "Дээл зураг дээрхээсээ ч илүү гоё. Хэмжээ нь яг бичсэнээр таарсан.", who: "Б. Сарнай", item: "Ноосон дээл" },
  { seller: "hadgalsan-tsag", stars: 5, text: "Савлагаа маш нямбай, маргааш нь хүргэгдсэн.", who: "Т. Тэмүүлэн", item: "Арьсан гар цүнх" },
  { seller: "hadgalsan-tsag", stars: 4, text: "Бугуйвч сайхан. Асуултад хурдан хариулсан.", who: "Э. Номин", item: "Мөнгөн бугуйвч" },
];

export const SELLER_ORDERS: SellerOrder[] = [
  { id: "VM-261118-0042", items: "Ноосон дээл, Мөнгөн бугуйвч", buyer: "Б. Батболд", total: 540000, status: "paid" },
  { id: "VM-261117-0039", items: "Арьсан гар цүнх", buyer: "Т. Тэмүүлэн", total: 145000, status: "shipped" },
  { id: "VM-261115-0031", items: "Жинсэн хүрэм", buyer: "Э. Номин", total: 120000, status: "delivered" },
  { id: "VM-261112-0024", items: "Хилэн түшлэгтэй сандал", buyer: "Г. Ану", total: 380000, status: "delivered" },
];
