import { Document } from 'mongoose'

/** customer: худалдан авагч, seller: дэлгүүртэй худалдагч, admin: платформын админ */
export const USER_ROLES = ['customer', 'seller', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

export interface IUser extends Document {
    /** Утас үндсэн нэвтрэх нэр (8 оронтой), имэйл сонголтоор */
    phone: string
    email?: string
    pass_hash?: string
    full_name: string
    role: UserRole
    active: number
    blocked: number
    failed_login_attempts: number
    last_login_at?: Date
    createdAt?: Date
    updatedAt?: Date
}

export interface IUserMethods {
    checkPassword(password: string): Promise<boolean>
    generateAuthToken(): string
}

export interface IUserCreate {
    phone: string
    email?: string
    pass_hash?: string
    full_name: string
    role?: UserRole
}
