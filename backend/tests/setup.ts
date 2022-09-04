import 'reflect-metadata'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })
dotenv.config({ path: '.env.test.local', override: true })

const requiredVariables = ['DATABASE_URL', 'REDIS_URL']
for (const key of requiredVariables) {
  if (!process.env[key]) {
    throw new Error(`Required environment variable not found: ${key}`)
  }
}
