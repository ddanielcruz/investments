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
  const tx = makeTransaction(1, 1)
  const normTx: ITransaction = {
    ...tx,
    unitPrice: tx.unitPrice.toNumber(),
    quantity: tx.quantity.toNumber(),
    fee: tx.fee.toNumber()
  }

  class TransactionsRepositoryStub implements ITransactionsRepository {
    async create(data: ITransactionAttr): Promise<ITransaction> {
      return { ...normTx, ...data }
    }

    async delete(id: number): Promise<ITransaction | null> {
      return { ...normTx, id }
    }

    async findAll(): Promise<ITransactionWithEntities[]> {
      return []
    }

    async update(id: number, data: ITransactionAttr): Promise<ITransaction | null> {
      return {
        ...normTx,
        ...data,
        id
      }
    }
  }
  return new TransactionsRepositoryStub()
}
