import 'reflect-metadata'
import 'dotenv/config'

import { Job, Worker } from 'bullmq'

import '../config/container'
import { logger } from '../config/logger'
import { config } from '../config/queue'
import * as redis from '../config/redis'

async function bootstrap() {
  logger.info(`Starting workers on ${config.name} queue`)
  return new Worker(config.name, handleJob, {
    connection: redis.connect({ maxRetriesPerRequest: null }),
    concurrency: config.concurrency
  })
}

async function handleJob(job: Job) {
  logger.info(`Processing job ${job.name}:${job.id}`)
}

process.on('SIGTERM', () => process.exit())

bootstrap()
