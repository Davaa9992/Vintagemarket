/**
 * Анхны өгөгдөл: админ, 8 ангилал, жишээ 4 дэлгүүр (худалдагчтай), 13 бараа.
 * npm run seed (.env-ийн ADMIN_PHONE, ADMIN_PASSWORD, SEED_SELLER_PASSWORD ашиглана)
 * Дахин ажиллуулахад байгаа өгөгдлийг давхардуулахгүй.
 */
import '../alias'
import '@root/loaders/env'
import mongoose from 'mongoose'
import config from '@root/config'
import logger from '@root/loaders/logger'
import '@root/loaders/db'
import { Category, Product, Shop, User } from '@root/models'
import { CategoryService, ShopService } from '@root/services'
import { SEED_PRODUCTS, SEED_SHOPS } from './seedData'

async function seedAdmin(): Promise<void> {
    const { phone, email, password } = config.admin
    if (!phone || !password) {
        logger.info('ADMIN_PHONE, ADMIN_PASSWORD тохируулаагүй тул админ үүсгэсэнгүй')
        return
    }
    if (await User.exists({ phone })) return
    await User.create({ phone, email: email || undefined, pass_hash: password, full_name: 'Админ', role: 'admin' })
    logger.info(`Админ үүслээ: ${phone}`)
}

async function seedShops(): Promise<void> {
    if (!config.seedSellerPassword) {
        logger.info('SEED_SELLER_PASSWORD тохируулаагүй тул жишээ дэлгүүр үүсгэсэнгүй')
        return
    }
    for (const s of SEED_SHOPS) {
        if (await Shop.exists({ slug: s.slug })) continue
        const { phone, owner, ...shop } = s
        const user =
            (await User.findOne({ phone })) ??
            (await User.create({ phone, pass_hash: config.seedSellerPassword, full_name: owner, role: 'seller' }))
        await Shop.create({ ...shop, owner_id: user._id, initials: ShopService.initialsOf(shop.name), rating_count: 12 })
        logger.info(`Дэлгүүр үүслээ: ${shop.name} (${phone})`)
    }
}

async function seedProducts(): Promise<void> {
    const now = Date.now()
    let created = 0
    for (const [i, p] of SEED_PRODUCTS.entries()) {
        if (await Product.exists({ slug: p.slug })) continue
        const [category, shop] = await Promise.all([
            Category.findOne({ slug: p.category }).select('_id').lean(),
            Shop.findOne({ slug: p.shop }).select('_id').lean()
        ])
        if (!category || !shop) continue
        const { category: _c, shop: _s, ...data } = p // eslint-disable-line @typescript-eslint/no-unused-vars
        await Product.create({
            ...data,
            category_id: category._id,
            shop_id: shop._id,
            images: [`/items/${p.slug}.svg`],
            quantity: 1,
            published: 1,
            status: 'available',
            // шинэ нь эхэндээ
            createdAt: new Date(now - i * 24 * 60 * 60 * 1000)
        })
        created++
    }
    if (created) logger.info(`Жишээ бараа үүслээ: ${created}`)
}

async function run(): Promise<void> {
    await mongoose.primary.asPromise()
    await seedAdmin()
    await CategoryService.ensureDefaults()
    await seedShops()
    await seedProducts()
    await mongoose.primary.close()
}

run().catch((error) => {
    logger.error(error)
    process.exit(1)
})
