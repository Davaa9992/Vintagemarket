import { FilterQuery, Types } from 'mongoose'
import { Category, Product, Shop } from '@root/models'
import { IPagination, IProduct } from '@root/interfaces'
import { FormatHelpers } from '@root/utils'

export interface ProductFilter {
    /** ангиллын slug, таслалаар олныг: "home,antiques" */
    category?: string[]
    grade?: string[]
    decade?: string[]
    /** дэлгүүрийн slug */
    shop?: string
    /** худалдагчийн өөрийн бараа (нийтлэгдээгүйг ч оруулна) */
    shop_id?: Types.ObjectId
    search?: string
    size?: string
    min_price?: number
    max_price?: number
    sort?: 'newest' | 'price_asc' | 'price_desc'
    /** Админ бол нийтлэгдээгүй, зарагдсан барааг ч харна */
    admin?: boolean
    status?: string
}

const SORTS: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 }
}

const SHOP_FIELDS = 'name slug initials city district'
const CATEGORY_FIELDS = 'name name_en slug'

const activeShopIds = async (): Promise<Types.ObjectId[]> =>
    (await Shop.find({ status: 'active' }).select('_id').lean()).map((s) => s._id)

const emptyPage = (pagination: IPagination) => ({ items: [] as IProduct[], pagination: { ...pagination, total: 0, total_page: 0 } })

const getProducts = async (pagination: IPagination, f: ProductFilter) => {
    const filter: FilterQuery<IProduct> = {}
    if (f.shop_id) {
        filter.shop_id = f.shop_id
        if (f.status) filter.status = f.status
    } else if (!f.admin) {
        filter.published = 1
        filter.status = { $ne: 'sold' }
        // Хаагдсан, түр хаасан дэлгүүрийн бараа харагдахгүй
        filter.shop_id = { $in: await activeShopIds() }
    } else if (f.status) filter.status = f.status
    if (f.category?.length) {
        const categories = await Category.find({ slug: { $in: f.category } }).select('_id').lean()
        if (!categories.length) return emptyPage(pagination)
        filter.category_id = { $in: categories.map((c) => c._id) }
    }
    if (f.shop) {
        const shop = await Shop.findOne({ slug: f.shop, status: 'active' }).select('_id').lean()
        if (!shop) return emptyPage(pagination)
        filter.shop_id = shop._id
    }
    if (f.grade?.length) filter.grade = { $in: f.grade }
    if (f.decade?.length) filter.decade = { $in: f.decade }
    if (f.search) {
        const re = new RegExp(FormatHelpers.escapeRegex(f.search), 'i')
        filter.$or = [{ name: re }, { brand: re }, { era: re }, { description: re }]
    }
    if (f.size) filter.size = new RegExp(`^${FormatHelpers.escapeRegex(f.size)}$`, 'i')
    if (f.min_price !== undefined || f.max_price !== undefined) {
        filter.price = {}
        if (f.min_price !== undefined) filter.price.$gte = f.min_price
        if (f.max_price !== undefined) filter.price.$lte = f.max_price
    }
    const [items, total] = await Promise.all([
        Product.find(filter)
            .sort(SORTS[f.sort] || SORTS.newest)
            .skip(pagination.offset)
            .limit(pagination.limit)
            .populate('category_id', CATEGORY_FIELDS)
            .populate('shop_id', SHOP_FIELDS)
            .lean(),
        Product.countDocuments(filter)
    ])
    return { items, pagination: { ...pagination, total, total_page: Math.ceil(total / pagination.limit) } }
}

/** id эсвэл slug-аар. Нийтэд зөвхөн нийтлэгдсэн бараа */
const getProduct = async (idOrSlug: string, admin = false) => {
    const filter: FilterQuery<IProduct> = FormatHelpers.isObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug }
    if (!admin) {
        filter.published = 1
        filter.shop_id = { $in: await activeShopIds() }
    }
    return Product.findOne(filter).populate('category_id', CATEGORY_FIELDS).populate('shop_id', SHOP_FIELDS).lean()
}

/** Худалдагчийн өөрийн бараа мөн эсэх */
const findOwned = async (id: Types.ObjectId, shopId: Types.ObjectId) =>
    Product.findOne({ _id: id, shop_id: shopId }).populate('category_id', CATEGORY_FIELDS).populate('shop_id', SHOP_FIELDS).lean()

/** Давхцахгүй slug үүсгэнэ: "suede-jacket", "suede-jacket-2" ... */
const uniqueSlug = async (name: string, exceptId?: Types.ObjectId): Promise<string> => {
    const base = FormatHelpers.slugify(name) || 'item'
    let slug = base
    for (let i = 2; await Product.exists({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }); i++) slug = `${base}-${i}`
    return slug
}

const createProduct = async (data: Partial<IProduct>) =>
    (await Product.create({ ...data, slug: await uniqueSlug(data.name) })).toObject()

const updateProduct = async (id: Types.ObjectId, data: Partial<IProduct>) => {
    const update: Partial<IProduct> = { ...data }
    if (data.name) update.slug = await uniqueSlug(data.name, id)
    return Product.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean()
}

/** Захиалгад орсон, зарагдсан барааг устгахгүй (захиалгын түүх эвдэрнэ) */
const deleteProduct = async (id: Types.ObjectId): Promise<boolean> =>
    (await Product.deleteOne({ _id: id, status: 'available' })).deletedCount > 0

const ProductService = { getProducts, getProduct, findOwned, createProduct, updateProduct, deleteProduct }

export default ProductService
