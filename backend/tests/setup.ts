import 'reflect-metadata'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })
dotenv.config({ path: '.env.test.local', override: true })
