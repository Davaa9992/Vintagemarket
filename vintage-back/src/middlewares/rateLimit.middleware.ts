import rateLimit from 'express-rate-limit'

const message = (text: string) => ({ status: 'error', statusCode: 429, message: text })

/** Нэвтрэх, бүртгүүлэх: 15 минутад 20 удаа */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: message('Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу.')
})

/** Захиалга, холбоо барих мессеж илгээх: 10 минутад 10 удаа */
const submitLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: message('Хэт олон хүсэлт. Түр хүлээнэ үү.')
})

export { authLimiter, submitLimiter }
