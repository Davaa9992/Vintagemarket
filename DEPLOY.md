# Vintage Mongolia-г интернэтэд гаргах (нэг VPS сервер)

## 1. Танд хэрэгтэй
- **VPS сервер**: Ubuntu 24.04, 2 GB RAM-аас дээш (DigitalOcean, Hetzner, Vultr, эсвэл Монголын хостинг). Сард ~6–12$.
- **Домэйн**: жишээ нь `vintage.mn`. Домэйн дээр 2 DNS бичлэг нэмнэ:
  - `A  @    <серверийн IP>`
  - `A  www  <серверийн IP>`

## 2. Сервер дээр (SSH-ээр орж)

```bash
# Docker суулгах
curl -fsSL https://get.docker.com | sh

# Төслийн файлуудыг хуулах (vintage-back, vintage-front, docker-compose.prod.yml, Caddyfile, .env.production.example)
mkdir -p /opt/vintage && cd /opt/vintage
# ... файлуудаа энд хуулна (scp эсвэл git clone)

cp .env.production.example .env
nano .env            # DOMAIN, JWT_SECRET (openssl rand -hex 32), ADMIN_PHONE, ADMIN_PASSWORD

docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml run --rm back node dist/src/scripts/seed.js
```

Хэдэн минутын дараа `https://<домэйн>` нээгдэнэ. HTTPS гэрчилгээг Caddy өөрөө авна.

## 3. Шалгах
- `https://<домэйн>/status` → backend ажиллаж байна
- Админаар нэвтрэх: `https://<домэйн>/login` (ADMIN_PHONE / ADMIN_PASSWORD)
- Шинэ худалдагч: бүртгүүлээд `/seller` дээр дэлгүүрээ нээнэ

## 4. Өдөр тутам
```bash
cd /opt/vintage
docker compose -f docker-compose.prod.yml logs -f back           # лог
docker compose -f docker-compose.prod.yml up --build -d          # шинэ код гаргах
# Өгөгдлийн нөөц (өдөр бүр хийхийг зөвлөе)
docker compose -f docker-compose.prod.yml exec -T mongo mongodump --archive --gzip > backup-$(date +%F).gz
```

Зураг `uploads` volume-д, өгөгдөл `mongo-data` volume-д хадгалагдана. Сервер устгахаас өмнө нөөцөө татаж аваарай.

## Одоогоор байхгүй
QPay (захиалга "pending" төлөвтэй үүснэ, бэлэн/дансаар төлнө), SMS баталгаажуулалт, админы дэлгэц, бараа засах.
