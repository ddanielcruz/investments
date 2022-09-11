import { Router } from 'express'

import { container } from '../../config/container'
import { IDeleteOperation } from '../../core/services/operations/delete-operation'
import { IListOperations } from '../../core/services/operations/list-operations'
import { IStoreOperation } from '../../core/services/operations/store-operation'
import { validId } from '../middleware'

export const routes = Router()

routes.get('/', async (_request, response) => {
  const service = container.get(IListOperations)
  const operations = await service.execute()

  return response.json(operations)
})

routes.post('/', async (request, response) => {
  const service = container.get(IStoreOperation)
  const operation = await service.execute(request.body)

  return response.status(201).json(operation)
})

routes.put('/:id', validId(), async (request, response) => {
  const service = container.get(IStoreOperation)
  const operation = await service.execute(request.body, parseInt(request.params.id))

  return response.json(operation)
})

routes.delete('/:id', validId(), async (request, response) => {
  const service = container.get(IDeleteOperation)
  await service.execute(parseInt(request.params.id))

  return response.status(204).send()
})
