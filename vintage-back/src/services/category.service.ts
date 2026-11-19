import { Types } from 'mongoose'
import { Category, Product } from '@root/models'
import { DEFAULT_CATEGORIES } from '@root/interfaces'

/** Ангиллууд дарааллаар + нийтлэгдсэн барааны тоо */
const getCategories = async () => {
    const [categories, counts] = await Promise.all([
        Category.find().sort({ position: 1, name: 1 }).lean(),
        Product.aggregate<{ _id: Types.ObjectId; total: number }>([
            { $match: { published: 1, status: { $ne: 'sold' } } },
            { $group: { _id: '$category_id', total: { $sum: 1 } } }
        ])
    ])
    const byId = new Map(counts.map((c) => [String(c._id), c.total]))
    return categories.map((c) => ({ ...c, product_count: byId.get(String(c._id)) ?? 0 }))
}

const findBySlug = async (slug: string, exceptId?: Types.ObjectId) =>
    Category.findOne({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }).lean()

const exists = async (id: Types.ObjectId): Promise<boolean> => !!(await Category.exists({ _id: id }))

const createCategory = async (data: { name: string; slug: string }) => {
    const last = await Category.findOne().sort({ position: -1 }).select('position').lean()
    return (await Category.create({ ...data, position: (last?.position ?? 0) + 1 })).toObject()
}

const updateCategory = async (id: Types.ObjectId, data: { name?: string; slug?: string; position?: number }) =>
    Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()

/** Бараатай ангиллыг устгахгүй */
const deleteCategory = async (id: Types.ObjectId): Promise<{ deleted: boolean; reason?: string }> => {
    const category = await Category.findById(id).lean()
    if (!category) return { deleted: false, reason: 'Ангилал олдсонгүй' }
    const products = await Product.countDocuments({ category_id: id })
    if (products) return { deleted: false, reason: `"${category.name}" ангилалд ${products} бараа байна. Эхлээд барааг шилжүүлэх эсвэл устгана уу.` }
    await Category.deleteOne({ _id: id })
    return { deleted: true }
}

/** Хоосон бол анхны ангиллуудыг үүсгэнэ */
const ensureDefaults = async (): Promise<number> => {
    if (await Category.estimatedDocumentCount()) return 0
    await Category.insertMany(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, position: i + 1 })))
    return DEFAULT_CATEGORIES.length
}

const CategoryService = { getCategories, findBySlug, exists, createCategory, updateCategory, deleteCategory, ensureDefaults }

export default CategoryService
