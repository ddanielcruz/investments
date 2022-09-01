import { Router } from 'express'

import { routes as assets } from './assets-routes'

export const routes = Router()
routes.use('/assets', assets)
