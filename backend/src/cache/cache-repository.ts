import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'
import Redis from 'ioredis'

export const DAY = 86400
export const HOUR = 3600
export const MINUTE = 60

@injectable()
export abstract class ICacheRepository {
  abstract write<T extends object>(key: string, value: T, ttl?: number): Promise<void>
  abstract read<T extends object>(key: string): Promise<T | null>
  abstract invalidate(key: string): Promise<void>
}

@provide(ICacheRepository)
export class CacheRepository implements ICacheRepository {
  constructor(private readonly redis: Redis) {}

  async write<T extends object>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value))
    if (ttl && ttl > 0) {
      await this.redis.expire(key, ttl)
    }
  }

  async read<T extends object>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(key)
  }
}
