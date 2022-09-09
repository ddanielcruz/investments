import 'dotenv/config'
import 'reflect-metadata'

import { api } from './api'
import { setup } from './config/container'
import { logger } from './config/logger'

async function bootstrap() {
  // TODO: Validate required variables were populated
  // TODO: Add repeatable jobs
  const { PORT = '3333' } = process.env
  api.listen(PORT, () => logger.info(`Service is running on port ${PORT}`))
}

process.on('SIGTERM', () => process.exit())

setup().then(bootstrap)
