import assert from 'assert'
import FormatHelpers from '../src/utils/formatHelpers'

describe('FormatHelpers.slugify', () => {
    it('makes url-safe slugs and keeps cyrillic', () => {
        assert.strictEqual(FormatHelpers.slugify("  70s Suede Jacket! "), '70s-suede-jacket')
        assert.strictEqual(FormatHelpers.slugify("Levi's 501"), 'levi-s-501')
        assert.strictEqual(FormatHelpers.slugify('Ноосон цамц'), 'ноосон-цамц')
    })
})

describe('FormatHelpers.orderCode', () => {
    it('returns V + 8 uppercase hex chars', () => {
        assert.match(FormatHelpers.orderCode(), /^V[0-9A-F]{8}$/)
    })
})

describe('FormatHelpers.isUrl', () => {
    it('accepts http(s) and local uploads only', () => {
        assert.ok(FormatHelpers.isUrl('https://example.com/a.jpg'))
        assert.ok(FormatHelpers.isUrl('/uploads/images/a.jpg'))
        assert.ok(FormatHelpers.isUrl('/items/deel.svg'))
        assert.ok(!FormatHelpers.isUrl('/items/../x.svg'))
        assert.ok(!FormatHelpers.isUrl('javascript:alert(1)'))
        assert.ok(!FormatHelpers.isUrl(42))
    })
})
