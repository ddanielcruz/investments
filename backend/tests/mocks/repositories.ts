import { ICacheRepository } from '../../src/cache/cache-repository'
import {
  IAssetWithSymbols,
  IAsset,
  IBroker,
  ITransaction,
  ITransactionAttr,
  ITransactionWithEntities
} from '../../src/database/models'
import {
  IAssetsRepository,
  IBrokersRepository,
  ITransactionsRepository
} from '../../src/database/repositories'
import { makeAsset, makeAssetSymbol, makeBroker, makeTransaction } from '../factories'

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

export const makeTransactionsRepository = (): ITransactionsRepository => {
  class TransactionsRepositoryStub implements ITransactionsRepository {
    async create(data: ITransactionAttr): Promise<ITransaction> {
      return { ...makeTransaction(1, 1), ...data }
    }

    async delete(id: number): Promise<ITransaction | null> {
      return { ...makeTransaction(1, 1), id }
    }

    async findAll(): Promise<ITransactionWithEntities[]> {
      return []
    }

    async update(id: number, data: ITransactionAttr): Promise<ITransaction | null> {
      return { ...makeTransaction(1, 1), ...data, id }
    }
  }
  return new TransactionsRepositoryStub()
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
