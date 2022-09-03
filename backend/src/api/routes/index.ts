import { Router } from 'express'

import { routes as assets } from './assets-routes'
import { routes as brokers } from './brokers-routes'
import { routes as transactions } from './transactions-routes'

export const routes = Router()
routes.use('/assets', assets)
routes.use('/brokers', brokers)
routes.use('/transactions', transactions)
