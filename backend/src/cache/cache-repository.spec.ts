import Redis from 'ioredis'

import { CacheRepository } from './cache-repository'

let redis: Redis

interface IData {
  value: string
}

const makeSut = () => {
  const sut = new CacheRepository(redis)
  const data: IData = { value: 'any-value' }

  return { sut, data }
}

describe('CacheRepository', () => {
  beforeAll(() => {
    const url = process.env.REDIS_URL!
    redis = new Redis(url)
  })

  beforeEach(async () => {
    const keys = await redis.keys('*')
    if (keys.length) await redis.del(keys)
  })

  afterAll(async () => {
    await redis.quit()
  })

  describe('write', () => {
    it('writes to redis', async () => {
      const { sut, data } = makeSut()
      await sut.write('any-key', data)
      const foundData = await redis.get('any-key')
      expect(foundData).toEqual(JSON.stringify(data))
    })

    it('writes with a TTL', async () => {
      const { sut, data } = makeSut()
      await sut.write('any-key', data, 60)
      const ttl = await redis.ttl('any-key')
      expect(ttl).toBeGreaterThan(0)
    })

    it('does not set TTL if not informed', async () => {
      const { sut, data } = makeSut()
      await sut.write('any-key', data)
      const ttl = await redis.ttl('any-key')
      expect(ttl).toEqual(-1)
    })

    it('updates existing value', async () => {
      const { sut, data } = makeSut()
      await sut.write('any-key', data)
      await sut.write('any-key', { ...data, value: 'other-value' })
      const foundData = await redis.get('any-key')
      expect(foundData).toEqual(JSON.stringify({ value: 'other-value' }))
    })
  })

  describe('read', () => {
    it('returns parsed data if key is found', async () => {
      const { sut, data } = makeSut()
      await sut.write('any-key', data)
      const foundData = await sut.read('any-key')
      expect(foundData).toEqual(data)
    })

    it('returns falsy if key is not found', async () => {
      const { sut } = makeSut()
      const foundData = await sut.read('any-key')
      expect(foundData).toBeFalsy()
    })
  })

  describe('invalidate', () => {
    it('invalidates received key', async () => {
      const { sut, data } = makeSut()
      await sut.write('any-key', data)
      await sut.invalidate('any-key')
      const exists = await redis.exists('any-key')
      expect(exists).toEqual(0)
    })
  })
})
