import Redis, { RedisOptions } from 'ioredis'

export function connect(options: RedisOptions = {}) {
  if (!process.env.REDIS_URL) {
    throw new Error('Redis URL not found.')
  }

  return new Redis(process.env.REDIS_URL, options)
}
