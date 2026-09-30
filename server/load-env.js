import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Loads the project's `.env` into process.env.
 *
 * This module is imported first by server/index.js, so every other module sees
 * the variables when it is evaluated (server/auth.js reads SUPABASE_* at import
 * time). Uses Node's built-in loader — no dotenv dependency.
 */
const envFile = join(dirname(fileURLToPath(import.meta.url)), '..', '.env')

if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    /* malformed or unreadable .env — the defaults below still apply */
  }
}