import { Types } from 'mongoose'
import { Product, Shop, User } from '@root/models'
import { IShop } from '@root/interfaces'
import { FormatHelpers } from '@root/utils'

/** Нийтэд харагдах талбарууд */
const PUBLIC_FIELDS = 'name slug initials city district focus bio sold_count rating rating_count createdAt'

/** Нэрний эхний 2 үсэг: "Хадгалсан Цаг" -> "ХЦ" */
const initialsOf = (name: string): string =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || '?'

/** Нээлттэй дэлгүүрүүд + идэвхтэй барааны тоо */
const getShops = async () => {
    const [shops, counts] = await Promise.all([
        Shop.find({ status: 'active' }).select(PUBLIC_FIELDS).sort({ sold_count: -1, createdAt: 1 }).lean(),
        Product.aggregate<{ _id: Types.ObjectId; total: number }>([
            { $match: { published: 1, status: 'available' } },
            { $group: { _id: '$shop_id', total: { $sum: 1 } } }
        ])
    ])
    const byId = new Map(counts.map((c) => [String(c._id), c.total]))
    return shops.map((s) => ({ ...s, listing_count: byId.get(String(s._id)) ?? 0 }))
}

const getShop = async (slug: string) => {
    const shop = await Shop.findOne({ slug, status: 'active' }).select(PUBLIC_FIELDS).lean()
    if (!shop) return null
    const listing_count = await Product.countDocuments({ shop_id: shop._id, published: 1, status: 'available' })
    return { ...shop, listing_count }
}

const getByOwner = async (ownerId: Types.ObjectId) => Shop.findOne({ owner_id: ownerId }).lean()

const uniqueSlug = async (name: string, exceptId?: Types.ObjectId): Promise<string> => {
    const base = FormatHelpers.slugify(name) || 'shop'
    let slug = base
    for (let i = 2; await Shop.exists({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }); i++) slug = `${base}-${i}`
    return slug
}

/** Дэлгүүр нээнэ: хэрэглэгч seller эрхтэй болно */
const createShop = async (ownerId: Types.ObjectId, data: Partial<IShop>) => {
    const shop = await Shop.create({
        ...data,
        owner_id: ownerId,
        slug: await uniqueSlug(data.name),
        initials: initialsOf(data.name)
    })
    await User.updateOne({ _id: ownerId, role: 'customer' }, { role: 'seller' })
    return shop.toObject()
}

const updateShop = async (id: Types.ObjectId, data: Partial<IShop>) => {
    const update: Partial<IShop> = { ...data }
    if (data.name) update.initials = initialsOf(data.name)
    return Shop.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean()
}

const exists = async (id: string | Types.ObjectId): Promise<boolean> => Boolean(await Shop.exists({ _id: id }))

/** Админд: бүх дэлгүүр (хаагдсан ч), эзэмшигчийн утастай */
const getAllShops = async (search?: string) => {
    const filter = search ? { name: new RegExp(FormatHelpers.escapeRegex(search), 'i') } : {}
    const [shops, counts] = await Promise.all([
        Shop.find(filter).sort({ createdAt: -1 }).limit(500).populate('owner_id', 'full_name phone').lean(),
        Product.aggregate<{ _id: Types.ObjectId; total: number }>([
            { $match: { published: 1, status: 'available' } },
            { $group: { _id: '$shop_id', total: { $sum: 1 } } }
        ])
    ])
    const byId = new Map(counts.map((c) => [String(c._id), c.total]))
    return shops.map((s) => ({ ...s, listing_count: byId.get(String(s._id)) ?? 0 }))
}

const setStatus = async (id: Types.ObjectId, status: IShop['status']) =>
    Shop.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean()

const ShopService = { exists, getAllShops, setStatus, getShops, getShop, getByOwner, createShop, updateShop, initialsOf }

export default ShopService
