import { Router } from 'express'

import { container } from '../../config/container'
import { IListBrokers } from '../../core/services/brokers/list-brokers'

export const routes = Router()

routes.get('/', async (_request, response) => {
  const service = container.get(IListBrokers)
  const brokers = await service.execute()

  return response.json(brokers)
})
