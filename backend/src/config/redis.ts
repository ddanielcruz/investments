import Redis from 'ioredis'

export function connect() {
  return new Redis(process.env.REDIS_URL || '', { maxRetriesPerRequest: null })
}
