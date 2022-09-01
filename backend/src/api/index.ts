import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import 'express-async-errors'

import '../config/container'
import { routes } from './routes'

// TODO: Add logger and error handler middleware
export const api = express()
api.use(helmet())
api.use(cors())
api.use(express.json())
api.use('/', routes)
