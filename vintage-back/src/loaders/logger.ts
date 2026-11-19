import winston from 'winston'

const { printf, combine, colorize, timestamp } = winston.format

// config-оос биш process.env-ээс шууд уншина (config ↔ logger circular import-оос сэргийлнэ)
const isDev = (process.env.NODE_ENV || 'development') === 'development'
const isTest = process.env.NODE_ENV === 'test'

const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: isTest
        ? [new winston.transports.Console({ silent: true })]
        : [
              new winston.transports.File({
                  filename: './logs/error.log',
                  level: 'error',
                  maxsize: 52428800, // 50MB
                  maxFiles: 50
              }),
              new winston.transports.File({
                  filename: './logs/combined.log',
                  maxsize: 52428800,
                  maxFiles: 50
              })
          ]
})

if (isDev) {
    winstonLogger.add(
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp(),
                printf((info) => `${info.level}: ${info.message}`)
            )
        })
    )
}

const logger: {
    error: (...args: unknown[]) => void
    debug: (...args: string[]) => void
    info: (...args: string[]) => void
} = {
    error(...args: unknown[]): void {
        const [first, meta] = args
        if (first instanceof Error) {
            winstonLogger.error(`${first.message}\n${first.stack || ''}`, { metadata: meta })
            return
        }
        winstonLogger.error(String(first), { metadata: meta })
    },
    debug(...args: string[]): void {
        winstonLogger.debug(args[0], { metadata: args[1] })
    },
    info(...args: string[]): void {
        winstonLogger.info(args[0], { metadata: args[1] })
    }
}

process.on('uncaughtException', (err): void => {
    logger.error(err)
})

process.on('unhandledRejection', (ex: Error): void => {
    logger.error(ex)
})

export default logger
