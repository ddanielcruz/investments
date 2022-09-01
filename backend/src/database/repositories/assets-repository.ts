import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { AssetProvider, AssetType, PrismaClient } from '@prisma/client'

export interface IAsset {
  id: number
  name: string
  ticker: string
  type: AssetType
}

export interface IAssetSymbol {
  symbol: string
  provider: AssetProvider
}

export interface IAssetWithSymbols {
  symbols: IAssetSymbol[]
}

@injectable()
export abstract class IAssetsRepository {
  abstract findById(id: number): Promise<IAssetWithSymbols | null>
  abstract findMany(query: string): Promise<IAsset[]>
}

@provide(IAssetsRepository)
export class AssetsRepository implements IAssetsRepository {
  constructor(private readonly client: PrismaClient) {}

  findById(id: number): Promise<IAssetWithSymbols | null> {
    return this.client.asset.findUnique({ where: { id }, include: { symbols: true } })
  }

  findMany(query: string): Promise<IAsset[]> {
    query = query.trim()
    return this.client.asset.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { ticker: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    })
  }
}
