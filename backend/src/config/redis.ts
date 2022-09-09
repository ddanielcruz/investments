import Redis, { RedisOptions } from 'ioredis'

export function connect(options: RedisOptions = {}) {
  return new Redis(process.env.REDIS_URL || '', options)
}
