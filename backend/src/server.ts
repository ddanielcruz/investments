import 'dotenv/config'
import 'reflect-metadata'

import { api } from './api'

function bootstrap() {
  const { PORT = '3333' } = process.env
  api.listen(PORT, () => console.log(`Service is running on port ${PORT}`))
}

process.on('SIGTERM', () => process.exit())

bootstrap()
