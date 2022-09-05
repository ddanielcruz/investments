import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { PrismaClient } from '@prisma/client'

import { IAssetWithSymbols, IAsset } from '../models'

@injectable()
export abstract class IAssetsRepository {
  abstract findById(id: number): Promise<IAssetWithSymbols | null>
  abstract findInvested(): Promise<IAssetWithSymbols[]>
  abstract findMany(query: string): Promise<IAsset[]>
}

@provide(IAssetsRepository)
export class AssetsRepository implements IAssetsRepository {
  constructor(private readonly client: PrismaClient) {}

  findById(id: number): Promise<IAssetWithSymbols | null> {
    return this.client.asset.findUnique({ where: { id }, include: { symbols: true } })
  }

  async findInvested(): Promise<IAssetWithSymbols[]> {
    return (
      await this.client.transaction.findMany({
        select: { asset: { include: { symbols: true } } },
        distinct: 'assetId'
      })
    ).map(({ asset }) => asset)
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
