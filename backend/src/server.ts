import 'dotenv/config'
import 'reflect-metadata'

import { api } from './api'
import { setup } from './config/container'
import { logger } from './config/logger'

const requiredVariables = ['DATABASE_URL', 'REDIS_URL', 'COINMARKETCAP_KEY', 'ALPHA_VANTAGE_KEY']

async function bootstrap() {
  // Validate required variables were populated
  for (const env of requiredVariables) {
    if (!process.env[env]) {
      throw new Error(`Required environment variable not found: ${env}`)
    }
  }

  // TODO: Add repeatable jobs
  const { PORT = '3333' } = process.env
  api.listen(PORT, () => logger.info(`Service is running on port ${PORT}`))
}

process.on('SIGTERM', () => process.exit())

setup().then(bootstrap)
