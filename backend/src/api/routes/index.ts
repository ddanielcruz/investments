import { Router } from 'express'

import { routes as assets } from './assets-routes'
import { routes as brokers } from './brokers-routes'
import { routes as operations } from './operations-routes'
import { routes as portfolio } from './portfolio-routes'

export const routes = Router()
routes.use('/assets', assets)
routes.use('/brokers', brokers)
routes.use('/operations', operations)
routes.use('/portfolio', portfolio)
