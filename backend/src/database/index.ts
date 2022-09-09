import { PrismaClient } from '@prisma/client'

export function connect() {
  return new PrismaClient()
}
