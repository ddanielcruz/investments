import { Router } from 'express'

import { container } from '../../config/container'
import { ISearchAssets } from '../../core/services/assets/search-assets'

export const routes = Router()

routes.get('/', async (request, response) => {
  const query = request.query.query?.toString() || ''
  const service = container.get(ISearchAssets)
  const assets = await service.execute(query)

  return response.json(assets)
})
