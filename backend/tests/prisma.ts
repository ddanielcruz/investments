// Source: https://blog.ludicroushq.com/a-better-way-to-run-integration-tests-with-prisma-and-postgresql
import 'dotenv/config'
import { execSync } from 'child_process'
import { randomBytes } from 'crypto'
import { join } from 'path'
import { URL } from 'url'

import { PrismaClient } from '@prisma/client'

let client: PrismaClient
let schema: string

const generateDatabaseUrl = (schema: string) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('Database URL not found.')
  }
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)

  return url.toString()
}

async function connect(): Promise<PrismaClient> {
  // Generate a new schema and database URL
  schema = `test-${randomBytes(16).toString('hex')}`
  const url = generateDatabaseUrl(schema)
  process.env.DATABASE_URL = url

  // Create a client with generated URL
  client = new PrismaClient({ datasources: { db: { url } } })

  // Push database schema
  const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma')
  execSync(`${prismaBinary} db push --skip-generate`, { env: process.env })

  return client
}

async function disconnect() {
  // Drop created schema before disconnecting
  await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
  await client.$disconnect()
}

export default { connect, disconnect }
