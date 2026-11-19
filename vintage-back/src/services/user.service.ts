import { FilterQuery, HydratedDocument, Types } from 'mongoose'
import { Shop, User } from '@root/models'
import { IUser, IUserCreate, IUserMethods, IPagination, UserRole } from '@root/interfaces'
import { FormatHelpers } from '@root/utils'

const MAX_FAILED_LOGINS = 5

const createUser = async (data: IUserCreate): Promise<HydratedDocument<IUser, IUserMethods>> =>
    User.create(data)

/** Утасны дугаараас зөвхөн 8 оронтой тоог авна: "+976 9911-2233" -> "99112233" */
const normalizePhone = (phone: string): string => String(phone || '').replace(/\D/g, '').replace(/^976(?=\d{8}$)/, '')

/** Утас эсвэл имэйлээр нэвтэрнэ */
const findForLogin = async (login: string) => {
    const value = String(login || '').trim()
    const filter = value.includes('@') ? { email: value.toLowerCase() } : { phone: normalizePhone(value) }
    return User.findOne(filter).select('+pass_hash')
}

const existsByEmail = async (email: string): Promise<boolean> => !!(await User.exists({ email }))

const existsByPhone = async (phone: string): Promise<boolean> => !!(await User.exists({ phone: normalizePhone(phone) }))

const registerFailedLogin = async (id: Types.ObjectId): Promise<void> => {
    const user = await User.findByIdAndUpdate(id, { $inc: { failed_login_attempts: 1 } }, { new: true })
    if (user && user.failed_login_attempts >= MAX_FAILED_LOGINS) {
        await User.updateOne({ _id: id }, { blocked: 1 })
    }
}

const registerSuccessfulLogin = async (id: Types.ObjectId): Promise<void> => {
    await User.updateOne({ _id: id }, { failed_login_attempts: 0, last_login_at: new Date() })
}

const getMe = async (id: Types.ObjectId) => {
    const user = await User.findById(id).lean()
    if (!user) return null
    const { _id, email, full_name, phone, role, createdAt } = user
    const shop = await Shop.findOne({ owner_id: _id }).select('name slug initials status').lean()
    return { _id, email, full_name, phone, role, createdAt, shop }
}

const updateProfile = async (id: Types.ObjectId, data: { full_name?: string; phone?: string }): Promise<void> => {
    const update = FormatHelpers.pick(data, ['full_name', 'phone'])
    if (Object.keys(update).length) await User.updateOne({ _id: id }, update, { runValidators: true })
}

const changePassword = async (id: Types.ObjectId, newPassword: string): Promise<void> => {
    const user = await User.findById(id).select('+pass_hash')
    user.pass_hash = newPassword
    await user.save()
}

const getUsers = async (pagination: IPagination, search?: string, role?: string) => {
    const filter: FilterQuery<IUser> = {}
    if (search) {
        const re = new RegExp(FormatHelpers.escapeRegex(search), 'i')
        filter.$or = [{ email: re }, { full_name: re }, { phone: re }]
    }
    if (role) filter.role = role
    const [items, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(pagination.offset).limit(pagination.limit).lean(),
        User.countDocuments(filter)
    ])
    return { items, pagination: { ...pagination, total, total_page: Math.ceil(total / pagination.limit) } }
}

const changeRole = async (id: Types.ObjectId, role: UserRole) =>
    User.findByIdAndUpdate(id, { role }, { new: true }).lean()

const setBlocked = async (id: Types.ObjectId, blocked: 0 | 1) => {
    const update = blocked ? { blocked } : { blocked, failed_login_attempts: 0 }
    return User.findByIdAndUpdate(id, update, { new: true }).lean()
}

const UserService = {
    MAX_FAILED_LOGINS,
    createUser,
    normalizePhone,
    findForLogin,
    existsByEmail,
    existsByPhone,
    registerFailedLogin,
    registerSuccessfulLogin,
    getMe,
    updateProfile,
    changePassword,
    getUsers,
    changeRole,
    setBlocked
}

export default UserService
