import { Document, Types } from 'mongoose'

/** active: нээлттэй, paused: түр хаасан, blocked: админ хаасан */
export const SHOP_STATUSES = ['active', 'paused', 'blocked'] as const
export type ShopStatus = (typeof SHOP_STATUSES)[number]

/** Худалдагчийн дэлгүүр. Нэг худалдагч нэг дэлгүүртэй */
export interface IShop extends Document {
    owner_id: Types.ObjectId
    name: string
    slug: string
    initials: string
    city: string
    district?: string
    focus?: string
    bio?: string
    status: ShopStatus
    sold_count: number
    rating: number
    rating_count: number
    createdAt?: Date
    updatedAt?: Date
}
