import mongoose, { Model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IUser, IUserMethods, USER_ROLES } from '@root/interfaces'
import config from '@root/config'

type UserModel = Model<IUser, object, IUserMethods>

const schema = new Schema<IUser, UserModel, IUserMethods>(
    {
        phone: { type: String, required: true, trim: true },
        email: { type: String, lowercase: true, trim: true },
        pass_hash: { type: String, select: false },
        full_name: { type: String, required: true, trim: true },
        role: { type: String, enum: USER_ROLES, default: 'customer' },
        active: { type: Number, enum: [0, 1], default: 1 },
        blocked: { type: Number, enum: [0, 1], default: 0 },
        failed_login_attempts: { type: Number, default: 0 },
        last_login_at: { type: Date }
    },
    {
        timestamps: true
    }
)

schema.index({ phone: 1 }, { unique: true })
// Имэйл сонголтоор тул зөвхөн байгаа үед давхцахгүй
schema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } })
schema.index({ role: 1 })

schema.methods.checkPassword = async function (password: string): Promise<boolean> {
    if (!this.pass_hash) return false
    return bcrypt.compare(password, this.pass_hash)
}

schema.methods.generateAuthToken = function (): string {
    return jwt.sign({ id: this._id, role: this.role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
    })
}

schema.pre('save', async function () {
    if (this.isModified('pass_hash')) {
        this.pass_hash = await bcrypt.hash(this.pass_hash, 10)
    }
})

const collectionName = 'users'
const modelName = 'User'

export default mongoose.primary.model<IUser, UserModel>(modelName, schema, collectionName)
