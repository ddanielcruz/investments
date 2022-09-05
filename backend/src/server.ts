import 'dotenv/config'
import 'reflect-metadata'

import { api } from './api'

// TODO: Validate required variables were populated
function bootstrap() {
  const { PORT = '3333' } = process.env
  api.listen(PORT, () => console.log(`Service is running on port ${PORT}`))
}

process.on('SIGTERM', () => process.exit())

bootstrap()
