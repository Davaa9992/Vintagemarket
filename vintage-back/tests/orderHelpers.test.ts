import assert from 'assert'
import { Types } from 'mongoose'
import OrderHelpers from '../src/utils/orderHelpers'

const a = new Types.ObjectId()
const b = new Types.ObjectId()
const names = new Map([
    [String(a), 'Хадгалсан Цаг'],
    [String(b), 'Ретро Хороолол']
])

describe('OrderHelpers.splitByShop', () => {
    it('groups items per shop with 10% commission and delivery per shop', () => {
        const r = OrderHelpers.splitByShop(
            [
                { shop_id: a, price: 280000, quantity: 1 },
                { shop_id: a, price: 260000, quantity: 1 },
                { shop_id: b, price: 185000, quantity: 1 }
            ],
            'ship',
            names
        )
        assert.strictEqual(r.shops.length, 2)
        const first = r.shops.find((s) => String(s.shop_id) === String(a))
        assert.strictEqual(first.shop_name, 'Хадгалсан Цаг')
        assert.strictEqual(first.subtotal, 540000)
        assert.strictEqual(first.commission, 54000)
        assert.strictEqual(first.delivery_fee, 6000)
        assert.strictEqual(first.payout, 540000 - 54000 + 6000)
        assert.strictEqual(r.subtotal, 725000)
        assert.strictEqual(r.delivery_fee, 12000)
        assert.strictEqual(r.total, 737000)
    })

    it('charges no delivery for pickup', () => {
        const r = OrderHelpers.splitByShop([{ shop_id: a, price: 35000, quantity: 2 }], 'pickup', names)
        assert.strictEqual(r.delivery_fee, 0)
        assert.strictEqual(r.total, 70000)
        assert.strictEqual(r.shops[0].payout, 63000)
    })
})

describe('OrderHelpers.overallStatus', () => {
    it('derives the parent status from shop parts', () => {
        assert.strictEqual(OrderHelpers.overallStatus('paid', ['shipped', 'paid']), 'paid')
        assert.strictEqual(OrderHelpers.overallStatus('paid', ['shipped', 'delivered']), 'shipped')
        assert.strictEqual(OrderHelpers.overallStatus('shipped', ['delivered', 'delivered']), 'completed')
        assert.strictEqual(OrderHelpers.overallStatus('pending', ['delivered', 'cancelled']), 'completed')
        assert.strictEqual(OrderHelpers.overallStatus('pending', ['cancelled']), 'cancelled')
    })

    it('limits what a seller can change', () => {
        assert.ok(OrderHelpers.canSellerMove('paid', 'shipped'))
        assert.ok(!OrderHelpers.canSellerMove('delivered', 'shipped'))
        assert.ok(!OrderHelpers.canSellerMove('paid', 'cancelled'))
    })
})
