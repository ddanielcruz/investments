import { Router } from 'express'

import { container } from '../../config/container'
import { IDeleteTransaction } from '../../core/services/transactions/delete-transaction'
import { IListTransactions } from '../../core/services/transactions/list-transactions'
import { IStoreTransaction } from '../../core/services/transactions/store-transaction'
import { validId } from '../middleware'

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

routes.put('/:id', validId(), async (request, response) => {
  const service = container.get(IStoreTransaction)
  const transaction = await service.execute(request.body, parseInt(request.params.id))

  return response.json(transaction)
})

routes.delete('/:id', validId(), async (request, response) => {
  const service = container.get(IDeleteTransaction)
  await service.execute(parseInt(request.params.id))

  return response.status(204).send()
})
