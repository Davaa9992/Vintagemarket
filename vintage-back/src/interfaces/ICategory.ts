import { Document } from 'mongoose'

/** Барааны ангилал. Админ нэмж, засаж, устгана */
export interface ICategory extends Document {
    name: string
    name_en?: string
    slug: string
    position: number
    createdAt?: Date
    updatedAt?: Date
}

/** Анх өгөгдлийн сан хоосон үед үүсэх 8 ангилал */
export const DEFAULT_CATEGORIES: { name: string; name_en: string; slug: string }[] = [
    { name: 'Хувцас, загвар', name_en: 'Clothing & Fashion', slug: 'clothing' },
    { name: 'Дагалдах хэрэгсэл', name_en: 'Accessories', slug: 'accessories' },
    { name: 'Тавилга, гэр ахуй', name_en: 'Furniture & Home', slug: 'home' },
    { name: 'Цуглуулга', name_en: 'Collectibles', slug: 'collectibles' },
    { name: 'Эртний эдлэл', name_en: 'Antiques', slug: 'antiques' },
    { name: 'Электроник', name_en: 'Electronics', slug: 'electronics' },
    { name: 'Ном, медиа', name_en: 'Books & Media', slug: 'media' },
    { name: 'Тоглоом, дурсгал', name_en: 'Toys & Memorabilia', slug: 'toys' }
]
