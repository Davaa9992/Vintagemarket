import { Request, Response } from 'express'
import { randomBytes } from 'crypto'
import { createWriteStream } from 'fs'
import { mkdir, unlink } from 'fs/promises'
import path from 'path'
import config from '@root/config'
import logger from '@root/loaders/logger'

/** Upload хийсэн файлууд /uploads/... замаар (loaders/express.ts) татагдана */
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')

/** Файлын төрөл бүрийн хавтас, зөвшөөрөгдөх өргөтгөл, дээд хэмжээ */
export const UPLOAD_KINDS = {
    // Барааны зураг (svg-г XSS-ээс сэргийлж зөвшөөрөхгүй)
    images: { exts: ['.jpg', '.jpeg', '.png', '.webp', '.gif'], maxMB: 10 }
} as const
export type UploadKind = keyof typeof UPLOAD_KINDS

class TooLargeError extends Error {}

/** Файлын нэрийг аюулгүй болгоно: зам, тусгай тэмдэгтийг хасаж үсэг (кирилл орно), тоо, . _ - үлдээнэ */
const safeName = (name: string): string =>
    path
        .basename(name)
        .normalize('NFC')
        .replace(/[^\p{L}\p{N}._-]+/gu, '_')
        .replace(/^\.+/, '')
        .slice(-100) || 'file'

/** Хүсэлтийн биеийг санах ойд бүтнээр нь уншилгүй дискэнд урсгалаар бичнэ  */
const saveBody = (req: Request, filePath: string, maxBytes: number): Promise<number> =>
    new Promise((resolve, reject) => {
        let size = 0
        let failed = false
        const out = createWriteStream(filePath)
        const fail = (error: Error): void => {
            if (failed) return
            failed = true
            req.unpipe(out)
            out.destroy()
            req.resume() // үлдсэнийг нь уншиж дуусгаад хариу (413) буцаана
            reject(error)
        }
        req.on('data', (chunk: Buffer) => {
            size += chunk.length
            if (size > maxBytes) fail(new TooLargeError())
        })
        req.on('error', fail)
        out.on('error', fail)
        out.on('finish', () => !failed && resolve(size))
        req.pipe(out)
    })

/**
 * Body нь файлын агуулга (application/octet-stream), ?name=<файлын нэр>
 * images — барааны зураг. Үзэх линкийг буцаана (Product.images-д хадгална)
 */
export const uploadFile =
    (kind: UploadKind) =>
    async (req: Request, res: Response): Promise<void> => {
        const { exts, maxMB } = UPLOAD_KINDS[kind]
        const maxBytes = maxMB * 1024 * 1024
        const name = safeName(String(req.query.name || ''))
        const ext = path.extname(name).toLowerCase()
        if (!(exts as readonly string[]).includes(ext)) {
            res.badRequest(new Error(`Зөвхөн ${exts.join(', ')} файл оруулна`))
            return
        }
        if (Number(req.headers['content-length'] || 0) > maxBytes) {
            res.respondWithError(new Error(`Файл ${maxMB}MB-аас том байна`), 413)
            return
        }
        const fileName = `${randomBytes(6).toString('hex')}-${name}`
        const dir = path.join(UPLOAD_DIR, kind)
        const filePath = path.join(dir, fileName)
        try {
            await mkdir(dir, { recursive: true })
            const size = await saveBody(req, filePath, maxBytes)
            if (!size) {
                await unlink(filePath).catch((): void => undefined)
                res.badRequest(new Error('Файл хоосон байна'))
                return
            }
            res.respondWithData({ url: `${config.host}/uploads/${kind}/${encodeURIComponent(fileName)}`, name, size })
        } catch (error) {
            await unlink(filePath).catch((): void => undefined)
            if (error instanceof TooLargeError) {
                res.respondWithError(new Error(`Файл ${maxMB}MB-аас том байна`), 413)
                return
            }
            logger.error(error)
            res.internalError(error as Error)
        }
    }
