# vintage-back

Vintage Mongolia олон худалдагчтай дэлгүүрийн backend. dataskills-back-тай ижил бүтэц: Node.js + TypeScript + Express + MongoDB (Mongoose).

```
src/
├── api/            Замууд: <нэр>/index.ts (router) + <нэр>.controller.ts
│   ├── user/       Бүртгүүлэх, нэвтрэх, профайл
│   ├── category/   Ангиллууд (нийтийн)
│   ├── product/    Бараа (нийтийн жагсаалт, дэлгэрэнгүй)
│   ├── shop/       Дэлгүүрүүд (нийтийн)
│   ├── seller/     Худалдагчийн самбар (sellerAuth)
│   ├── order/      Захиалга өгөх, шалгах, миний захиалгууд
│   ├── contact/    Холбоо барих форм
│   ├── admin/      product, category, order, contact, user, upload (adminAuth)
│   └── routes.ts
├── config/         Тохиргоо (.env)
├── interfaces/     TypeScript төрлүүд
├── loaders/        db, env, express, logger, routes
├── middlewares/    auth, pagination, rateLimit, validate
├── models/         Mongoose схемүүд
├── scripts/       seed.ts: админ, 8 ангилал, 4 дэлгүүр, 13 бараа
├── services/       Бизнес логик
├── utils/          Туслах функцууд, response helpers
├── bootstrap.ts
└── server.ts
tests/              mocha тестүүд
uploads/images/     Барааны зураг
```

## Ажиллуулах

```
cp .env.example .env
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000/v1/...`, шалгах: `GET /status`.

MongoDB хэрэгтэй (`MONGODB_DEV_URI`). Бүгдийг Docker-оор нэг дор асаах бол дээд хавтасны `docker-compose.yml`-г үзнэ үү.

Seed хийсний дараа:

- Админ: `ADMIN_PHONE` / `ADMIN_PASSWORD`
- Худалдагч: `99110001`–`99110004` / `SEED_SELLER_PASSWORD` (жишээ нь Хадгалсан Цаг = 99110001)

## Гол ойлголтууд

- **Нэвтрэлт** утасны дугаараар (8 орон, `+976` байж болно). JWT нь `token` cookie эсвэл `Authorization: Bearer`.
- **Дэлгүүр**: нэг хэрэглэгч нэг дэлгүүр. Нээхэд эрх нь `customer` → `seller`.
- **Бараа**: A–D төлвийн зэрэглэл (`grade`), он үе (`decade`: old, 60, 70, 80, 90, 00), материал, өнгө, хэмжээ (`measurements`).
- **Захиалга** худалдагч бүрээр хуваагдана (`shops[]`): шимтгэл 10%, хүргэлт дэлгүүр тус бүрт 6,000₮,
  худалдагчид олгох = дүн − шимтгэл + хүргэлт. Худалдагч өөрийн хэсгийг `shipped` → `delivered` болгоно,
  ерөнхий төлөв нь хэсгүүдээсээ тооцогдоно.

## Замууд

| Зам | Тайлбар |
| --- | --- |
| `POST /user/sign_up` | `{ phone, full_name, password }` |
| `POST /user/login` | `{ login (утас эсвэл имэйл), password }` → `{ token, user }` |
| `GET /user/info` | Өөрийн мэдээлэл + `shop` |
| `GET /category` | 8 ангилал |
| `GET /product` | `?category=home,antiques&grade=A,B&era=70,80&shop=<slug>&search=&min_price=&max_price=&sort=newest\|price_asc\|price_desc` |
| `GET /product/:idOrSlug` | Дэлгэрэнгүй (ангилал, дэлгүүртэй) |
| `GET /shop`, `GET /shop/:slug` | Нээлттэй дэлгүүрүүд, барааны тоотой |
| `POST /order` | `{ customer, items[{product_id, quantity}], delivery: ship\|pickup, payment_method: cash\|qpay\|bank_transfer }` |
| `GET /order/track?code=&phone=` | Захиалга шалгах |
| `POST /seller/shop` | Дэлгүүр нээх `{ name, city, district?, focus?, bio? }` |
| `GET/PATCH /seller/shop` | Өөрийн дэлгүүр |
| `GET /seller/summary` | Энэ сарын борлуулалт, шимтгэл, олгох дүн, илгээх захиалга |
| `GET/POST /seller/product`, `GET/PATCH/DELETE /seller/product/:id` | Өөрийн бараа |
| `GET /seller/order`, `PATCH /seller/order/:id/status` | Өөрийн захиалгын хэсэг, `{ status: shipped\|delivered\|cancelled }` |
| `POST /seller/upload/image?name=a.jpg` | Зураг (биед нь файлын агуулга) |
| `GET /admin/shop`, `PATCH /admin/shop/:id/status` | Дэлгүүрүүд, `{ status: active\|paused\|blocked }`. Хаагдсан дэлгүүрийн бараа нийтэд харагдахгүй |
| `/admin/...` | product (`shop_id` заана), category, order, contact, user, upload |

QPay одоогоор холбогдоогүй: `payment_method: qpay` захиалга `pending` төлөвтэй үүснэ.
