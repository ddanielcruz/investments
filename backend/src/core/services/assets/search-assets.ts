import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { IAsset, IAssetsRepository } from '../../../database/repositories/assets-repository'

@injectable()
export abstract class ISearchAssets {
  abstract execute(query: string): Promise<IAsset[]>
}

@provide(ISearchAssets)
export class SearchAssets implements ISearchAssets {
  constructor(private readonly assetsRepository: IAssetsRepository) {}

  execute(query: string): Promise<IAsset[]> {
    return this.assetsRepository.findMany(query)
  }
}
