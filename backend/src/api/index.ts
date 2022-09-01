import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import 'express-async-errors'

import '../config/container'
import { logger, errorHandler } from './middleware'
import { routes } from './routes'

export const api = express()
api.use(helmet())
api.use(cors())
api.use(express.json())
api.use(logger)
api.use('/', routes)
api.use(errorHandler)
