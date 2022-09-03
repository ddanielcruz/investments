import { Router } from 'express'

import { container } from '../../config/container'
import { ICreateTransaction } from '../../core/services/transactions/create-transaction'
import { IListTransactions } from '../../core/services/transactions/list-transactions'

export const routes = Router()

routes.get('/', async (_request, response) => {
  const service = container.get(IListTransactions)
  const transactions = await service.execute()

  return response.json(transactions)
})

routes.post('/', async (request, response) => {
  const service = container.get(ICreateTransaction)
  const transaction = await service.execute(request.body)

  return response.status(201).json(transaction)
})
