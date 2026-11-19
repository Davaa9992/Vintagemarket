# Vintage Mongolia

Олон худалдагчтай vintage дэлгүүр: `vintage-front` (Next.js) + `vintage-back` (Express + MongoDB).

## Нэг командаар асаах (Docker)

Энэ хавтсанд (docker-compose.yml байгаа газар):

```
docker compose up --build -d
docker compose run --rm back node dist/src/scripts/seed.js
```

- Сайт: http://localhost:3000
- API: http://localhost:5000/v1/status
- Худалдагчаар нэвтрэх: `99110001` / `demo1234` (4 жишээ дэлгүүр: 99110001–99110004)
- Админ: `99000000` / `admin12345`

Нууц үг, JWT_SECRET-ээ солих бол энэ хавтсанд `.env` үүсгэж `JWT_SECRET=...`, `ADMIN_PASSWORD=...` гэж бичнэ.

## Docker-гүй

1. MongoDB асаана (`mongodb://127.0.0.1:27017`).
2. `cd vintage-back && cp .env.example .env && npm install && npm run seed && npm run dev`
3. `cd vintage-front && cp .env.example .env.local && npm install && npm run dev`

Дэлгэрэнгүйг хавтас бүрийн README-с үзнэ үү.

## Интернэтэд гаргах

Нэг VPS сервер + домэйн дээр HTTPS-тэй ажиллуулах алхмууд: [DEPLOY.md](DEPLOY.md) (`docker-compose.prod.yml`, `Caddyfile`).
