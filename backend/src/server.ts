import 'dotenv/config'
import 'reflect-metadata'

import { api } from './api'
import { logger } from './config/logger'

// TODO: Validate required variables were populated
function bootstrap() {
  const { PORT = '3333' } = process.env
  api.listen(PORT, () => logger.info(`Service is running on port ${PORT}`))
}

process.on('SIGTERM', () => process.exit())

bootstrap()
