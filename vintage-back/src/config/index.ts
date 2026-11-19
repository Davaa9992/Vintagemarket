import logger from '@root/loaders/logger'

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const config = {
    env: process.env.NODE_ENV,

    host: process.env.NODE_HOST,

    frontendHost: process.env.FRONTEND_HOST,

    /**
     * Server port
     */
    port: parseInt(process.env.NODE_PORT, 10) || 5000,

    /**
     * Maximum time for the controller to execute
     */
    apiMaxTimeoutMS: parseInt(process.env.API_MAX_TIMEOUT_MS, 10) || 100000,

    logs: {
        morgan: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    },

    api: {
        prefix: '/v1'
    },

    /**
     * CORS allowed origins by array
     */
    corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),

    mongoDB: {
        primaryURI:
            process.env.NODE_ENV === 'production'
                ? process.env.MONGODB_PROD_URI
                : process.env.MONGODB_DEV_URI
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '30d'
    },

    cookie: {
        secure: process.env.COOKIE_SECURE === 'true',
        maxAgeMS: 30 * 24 * 60 * 60 * 1000
    },

    /** Анхны админ (scripts/seed.ts) */
    admin: {
        phone: process.env.ADMIN_PHONE,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
    },

    /** Жишээ худалдагчдын нууц үг (scripts/seed.ts, зөвхөн хөгжүүлэлтэд) */
    seedSellerPassword: process.env.SEED_SELLER_PASSWORD
}

export function configureEnvironment(): void {
    if (!config.mongoDB.primaryURI) {
        logger.error(
            'No mongo connection string. Set MONGODB_DEV_URI/MONGODB_PROD_URI environment variable.'
        )
        process.exit(1)
    }
    if (!config.jwt.secret) {
        logger.error('No JWT_SECRET set.')
        process.exit(1)
    }
}

export default config
