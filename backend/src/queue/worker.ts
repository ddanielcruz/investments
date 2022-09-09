import 'reflect-metadata'
import 'dotenv/config'

import { Job, Worker } from 'bullmq'
import Redis from 'ioredis'

import { container, setup } from '../config/container'
import { logger } from '../config/logger'
import { config } from '../config/queue'

async function bootstrap() {
  logger.info(`Starting workers on ${config.name} queue`)
  return new Worker(config.name, handleJob, {
    connection: container.get(Redis),
    concurrency: config.concurrency
  })
}

async function handleJob(job: Job) {
  logger.info(`Processing job ${job.name}:${job.id}`)
}

process.on('SIGTERM', () => process.exit())

setup().then(bootstrap)
