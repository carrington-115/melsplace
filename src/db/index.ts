import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Lazily initialised so the module can be imported during Next.js build
// without a DATABASE_URL present.  The actual connection is only created
// the first time `db` is accessed (i.e. inside a request handler).
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

function getDb() {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL environment variable is not set")
  const client = postgres(url, { prepare: false })
  _db = drizzle(client, { schema })
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop]
  },
})

export * from "./schema"
