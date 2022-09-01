import { IAsset, IAssetsRepository } from '../../../database/repositories/assets-repository'

export abstract class ISearchAssets {
  abstract execute(query: string): Promise<IAsset[]>
}

export class SearchAssets implements ISearchAssets {
  constructor(private readonly assetsRepo: IAssetsRepository) {}

  async execute(query: string): Promise<IAsset[]> {
    return this.assetsRepo.findMany(query)
  }
}
