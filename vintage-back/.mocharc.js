// Node 22.6+ нь .ts файлыг өөрөө уншихыг оролддог тул ts-node-д үлдээхийн тулд унтраана
const [major, minor] = process.versions.node.split('.').map(Number)
const nodeStripsTypes = major > 22 || (major === 22 && minor >= 6)

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

module.exports = {
    require: ['ts-node/register', 'tsconfig-paths/register'],
    extension: ['ts'],
    spec: 'tests/**/*.test.ts',
    exit: true,
    timeout: 20000,
    ...(nodeStripsTypes ? { 'node-option': ['no-experimental-strip-types'] } : {})
}
