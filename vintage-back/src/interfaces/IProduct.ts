import { Document, Types } from 'mongoose'

/** Төлвийн зэрэглэл: A маш сайн, B сайн, C ул мөртэй, D засвар шаардлагатай */
export const PRODUCT_GRADES = ['A', 'B', 'C', 'D'] as const
export type ProductGrade = (typeof PRODUCT_GRADES)[number]

/** Он үеийн шүүлтүүр: old = 1960-аас өмнө */
export const PRODUCT_DECADES = ['old', '60', '70', '80', '90', '00'] as const
export type ProductDecade = (typeof PRODUCT_DECADES)[number]

/** available: зарагдаж байгаа, reserved: захиалгад орсон, sold: зарагдсан */
export const PRODUCT_STATUSES = ['available', 'reserved', 'sold'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export interface IMeasurement {
    label: string
    cm: number
}

export interface IProduct extends Document {
    shop_id: Types.ObjectId
    name: string
    slug: string
    description?: string
    category_id: Types.ObjectId
    price: number
    size?: string
    brand?: string
    material?: string
    color?: string
    era?: string
    decade?: ProductDecade
    grade: ProductGrade
    grade_note?: string
    measurements: IMeasurement[]
    images: string[]
    quantity: number
    status: ProductStatus
    published: number
    createdAt?: Date
    updatedAt?: Date
}
