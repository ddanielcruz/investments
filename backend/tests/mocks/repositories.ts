import { ICacheRepository } from '../../src/cache/cache-repository'
import {
  IAssetWithSymbols,
  IAsset,
  IBroker,
  IOperation,
  IOperationAttr,
  IOperationWithEntities
} from '../../src/database/models'
import {
  IAssetsRepository,
  IBrokersRepository,
  IOperationsRepository
} from '../../src/database/repositories'
import { IQueueRepository } from '../../src/queue/queue-repository'
import { makeAsset, makeAssetSymbol, makeBroker, makeOperation } from '../factories'

export const makeAssetsRepository = (): IAssetsRepository => {
  class AssetsRepositoryStub implements IAssetsRepository {
    async findInvested(): Promise<IAssetWithSymbols[]> {
      return []
    }

    async findById(): Promise<IAssetWithSymbols | null> {
      return { ...makeAsset(), symbols: [makeAssetSymbol()] }
    }

    async findMany(): Promise<IAsset[]> {
      return []
    }
  }
  return new AssetsRepositoryStub()
}

export const makeBrokersRepository = (): IBrokersRepository => {
  class BrokersRepositoryStub implements IBrokersRepository {
    async findAll(): Promise<IBroker[]> {
      return []
    }

    async findById(id: number): Promise<IBroker | null> {
      return makeBroker({ id })
    }
  }
  return new BrokersRepositoryStub()
}

export const makeOperationsRepository = (): IOperationsRepository => {
  class OperationsRepositoryStub implements IOperationsRepository {
    async create(data: IOperationAttr): Promise<IOperation> {
      return { ...makeOperation(1, 1), ...data }
    }

    async delete(id: number): Promise<IOperation | null> {
      return { ...makeOperation(1, 1), id }
    }

    async findAll(): Promise<IOperationWithEntities[]> {
      return []
    }

    async update(id: number, data: IOperationAttr): Promise<IOperation | null> {
      return { ...makeOperation(1, 1), ...data, id }
    }
  }
  return new OperationsRepositoryStub()
}

export const makeCacheRepository = (): ICacheRepository => {
  class CacheRepositoryStub implements ICacheRepository {
    async write() {}

    async read() {
      return null
    }

    async invalidate(): Promise<void> {}
  }
  return new CacheRepositoryStub()
}

export const makeQueueRepository = (): IQueueRepository => {
  class QueueRepositoryStub implements IQueueRepository {
    async add(): Promise<void> {}
  }

  return new QueueRepositoryStub()
}
