import mongoose, { Connection, ConnectOptions } from 'mongoose'
import config from '@root/config'
import logger from '@root/loaders/logger'

declare module 'mongoose' {
    export let primary: Connection
}

const options: ConnectOptions = {
    // Production дээр index-үүдийг migration/скриптээр үүсгэвэл false болгоорой
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
}

mongoose.primary = mongoose.createConnection(config.mongoDB.primaryURI, options)

if (config.env === 'development') mongoose.set('debug', true)

const dbName = (): string => mongoose.primary.db?.databaseName || 'null'

mongoose.primary.on('connected', () => logger.info(`Database connection to [${dbName()}]: SUCCESSFUL`))
mongoose.primary.on('disconnected', () =>
    logger.info(`Database connection to [${dbName()}]: DISCONNECTED`)
)
mongoose.primary.on('reconnected', () =>
    logger.info(`Database connection to [${dbName()}]: RECONNECTED`)
)
mongoose.primary.on('error', (error: Error): void => {
    logger.error(`Error: ${error.message}`)
})

// Эхний холболт амжилтгүй бол mongoose өөрөө дахин оролддоггүй (сервер өгөгдлийн сангүй үлдэнэ).
// ts-node эхлэхдээ процессыг удаан түгжвэл serverSelectionTimeoutMS хэтэрч болдог тул дахин оролдоно
const RETRY_MS = 3000
const retryConnect = (): void => {
    logger.info(`Database: ${RETRY_MS / 1000} секундын дараа дахин холбогдоно`)
    setTimeout(() => {
        mongoose.primary.openUri(config.mongoDB.primaryURI, options).catch(retryConnect)
    }, RETRY_MS)
}
mongoose.primary.asPromise().catch(retryConnect)

export default {}
