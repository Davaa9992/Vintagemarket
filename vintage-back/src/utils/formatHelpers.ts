import crypto from 'crypto'
import { Types } from 'mongoose'

function isObjectId(value: unknown): boolean {
    return typeof value === 'string' && Types.ObjectId.isValid(value) && /^[a-f\d]{24}$/i.test(value)
}

function toObjectId(value: string): Types.ObjectId {
    return new Types.ObjectId(value)
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isUrl(value: unknown): boolean {
    if (typeof value !== 'string') return false
    // /uploads/: backend-ийн зураг, /items/: front-end-ийн жишээ чимэглэл (seed)
    if (value.startsWith('/uploads/') || /^\/items\/[\w-]+\.svg$/.test(value)) return true
    try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:'
    } catch {
        return false
    }
}

/** "70s Suede Jacket" -> "70s-suede-jacket" (кирилл үсгийг хэвээр үлдээнэ) */
function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
}

/** Захиалгын дугаар: V + 8 тэмдэгт (жишээ: V8F3A1C9B) */
function orderCode(): string {
    return 'V' + crypto.randomBytes(4).toString('hex').toUpperCase()
}

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const out = {} as Pick<T, K>
    for (const key of keys) {
        if (obj && obj[key] !== undefined) out[key] = obj[key]
    }
    return out
}

export default { isObjectId, toObjectId, escapeRegex, isUrl, slugify, orderCode, pick }
