import { Router } from 'express'

import { container } from '../../config/container'
import { ICreateTransaction } from '../../core/services/transactions/create-transaction'

export const routes = Router()

routes.post('/', async (request, response) => {
  const service = container.get(ICreateTransaction)
  const transaction = await service.execute(request.body)

  return response.status(201).json(transaction)
})
