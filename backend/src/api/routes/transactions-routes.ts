import { Router } from 'express'

import { container } from '../../config/container'
import { IListTransactions } from '../../core/services/transactions/list-transactions'
import { IStoreTransaction } from '../../core/services/transactions/store-transaction'

export const routes = Router()

routes.get('/', async (_request, response) => {
  const service = container.get(IListTransactions)
  const transactions = await service.execute()

  return response.json(transactions)
})

routes.post('/', async (request, response) => {
  const service = container.get(IStoreTransaction)
  const transaction = await service.execute(request.body)

  return response.status(201).json(transaction)
})
