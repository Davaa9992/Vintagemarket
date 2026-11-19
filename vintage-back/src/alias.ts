/**
 * Build хийсэн (dist) үед @root alias-г module-alias-аар бүртгэнэ.
 * ts-node (dev, test) үед tsconfig-paths ажиллана.
 */
if (__filename.endsWith('.js')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('module-alias/register')
}

export default {}
