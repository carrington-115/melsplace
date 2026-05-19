// Bootstrap: load env BEFORE tsx registers and runs seed.ts
require('dotenv').config({ path: '.env.local' })
require('./node_modules/tsx/dist/cjs/index.cjs')
require('./src/db/seed.ts')
