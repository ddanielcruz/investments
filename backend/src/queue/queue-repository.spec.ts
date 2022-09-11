import { Queue } from 'bullmq'
import Redis from 'ioredis'

import { QueueRepository } from './queue-repository'

let queue: Queue
let redis: Redis

const makeSut = () => {
  return new QueueRepository(queue)
}

describe('QueueRepository', () => {
  beforeAll(() => {
    redis = new Redis(process.env.REDIS_URL!)
    queue = new Queue('test-queue', { connection: redis })
  })

  afterEach(async () => {
    const keys = await redis?.keys('*')
    if (keys && keys.length) await redis.del(keys)
  })

  afterAll(async () => {
    await queue?.close()
    await redis?.quit()
  })

  describe('add', () => {
    it('adds a new job to the queue', async () => {
      await makeSut().add('any-job', 'any-data')
      const jobs = await queue.getJobs()
      expect(jobs).toHaveLength(1)
      expect(jobs[0]).toMatchObject({
        name: 'any-job',
        data: 'any-data'
      })
    })

    it('adds a new job with options', async () => {
      await makeSut().add('any-job', 'any-data', { attempts: 3, delay: 1000, priority: 10 })
      const jobs = await queue.getJobs()
      expect(jobs).toHaveLength(1)
      expect(jobs[0]).toMatchObject({
        name: 'any-job',
        data: 'any-data',
        opts: {
          attempts: 3,
          delay: 1000,
          priority: 10
        }
      })
    })
  })
})
