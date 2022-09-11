import 'reflect-metadata'
import 'dotenv/config'

import { Worker } from 'bullmq'
import Redis from 'ioredis'

import { container, setup } from '../config/container'
import { logger } from '../config/logger'
import { config } from '../config/queue'
import { resolveJobs } from './jobs'

async function bootstrap() {
  logger.info(`Starting workers on ${config.name} queue`)
  const jobs = resolveJobs()

  return new Worker(
    config.name,
    async job => {
      logger.info(`Processing job ${job.name}:${job.id}`)
      try {
        if (!jobs[job.name]) {
          throw new Error(`Job ${job.name} not supported/mapped.`)
        }

        return await jobs[job.name].execute(job.data)
      } catch (error) {
        logger.error(error)
        throw error
      }
    },
    {
      connection: container.get(Redis),
      concurrency: config.concurrency
    }
  )
}

process.on('SIGTERM', () => process.exit())

setup().then(bootstrap)
