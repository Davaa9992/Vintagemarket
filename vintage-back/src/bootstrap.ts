import express, { Application } from 'express'
import '@root/loaders/logger'
import '@root/loaders/db'
import '@root/utils/responseHelpers'
import { configureEnvironment } from '@root/config'
import configureServer from '@root/loaders/express'
import configureRoutes from '@root/loaders/routes'
import mongoose from 'mongoose'
import logger from '@root/loaders/logger'
import { CategoryService } from '@root/services'

/** Ангилал хоосон бол (анх удаа) анхны жагсаалтаар үүсгэнэ */
const seedCategories = (): void => {
    CategoryService.ensureDefaults()
        .then((n) => n && logger.info(`Ангиллууд үүслээ: ${n}`))
        .catch((error) => logger.error(error))
}

async function load(): Promise<Application> {
    configureEnvironment()

    // Холболт дахин оролдлогоор (loaders/db.ts) тогтсон ч 'open' үүснэ
    if (mongoose.primary.readyState === 1) seedCategories()
    else mongoose.primary.once('open', seedCategories)

    const app = express()

    configureServer(app)
    configureRoutes(app)

    return app
}

export default load()
