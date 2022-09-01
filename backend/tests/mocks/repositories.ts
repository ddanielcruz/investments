import { IBroker, IBrokersRepository } from '../../src/database/repositories'
import {
  IAsset,
  IAssetsRepository,
  IAssetWithSymbols
} from '../../src/database/repositories/assets-repository'
import { makeAsset, makeAssetSymbol } from '../factories'

export const makeAssetsRepository = (): IAssetsRepository => {
  class AssetsRepositoryStub implements IAssetsRepository {
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
  }
  return new BrokersRepositoryStub()
}
