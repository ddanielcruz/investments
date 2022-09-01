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
