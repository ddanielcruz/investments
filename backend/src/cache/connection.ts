import Redis from 'ioredis'

export function connect() {
  if (!process.env.REDIS_URL) {
    throw new Error('Redis URL not found.')
  }

  return new Redis(process.env.REDIS_URL)
}
