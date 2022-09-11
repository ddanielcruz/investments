import { Queue, QueueScheduler } from 'bullmq'
import Redis from 'ioredis'

import { container } from '../config/container'
import { config } from '../config/queue'
import { PROCESS_PORTFOLIO_METRICS } from './jobs/process-portfolio-metrics'

const { PORTFOLIO_PROC_INTERVAL = '3600' } = process.env
const SECOND = 1000

export function connect() {
  const connection = container.get(Redis)
  const scheduler = new QueueScheduler(config.name, { connection })
  const queue = new Queue(config.name, { connection })

  connection.on('close', async () => {
    await scheduler.close()
    await scheduler.disconnect()
  })

  return queue
}

export async function setup() {
  const queue = container.get(Queue)

  // Clean existing repeatable jobs
  const repeatableJobs = await queue.getRepeatableJobs()
  await Promise.all(repeatableJobs.map(job => queue.removeRepeatableByKey(job.key)))

  // Setup repeatable jobs
  const portfolioInterval = parseInt(PORTFOLIO_PROC_INTERVAL) || 3600
  await queue.add(PROCESS_PORTFOLIO_METRICS, undefined, {
    repeat: {
      every: portfolioInterval * SECOND,
      immediately: true
    }
  })
}
