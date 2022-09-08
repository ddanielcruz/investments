import { Queue } from 'bullmq'
import Redis from 'ioredis'

import { container } from '../config/container'
import { config } from '../config/queue'

export function connect() {
  const connection = container.get(Redis)
  return new Queue(config.name, { connection })
}
