import { Router } from 'express'

import { container } from '../../config/container'
import { IRetrievePortfolio } from '../../core/services/portfolio/retrieve-portfolio'

export const routes = Router()

routes.get('/', async (_request, response) => {
  const service = container.get(IRetrievePortfolio)
  const portfolio = await service.execute()

  return response.json(portfolio)
})
