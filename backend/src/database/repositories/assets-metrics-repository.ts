import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { PrismaClient } from '@prisma/client'

import { IAssetMetricsAttr, IAssetMetricsWithAsset } from '../models'

@injectable()
export abstract class IAssetsMetricsRepository {
  abstract findAll(): Promise<IAssetMetricsWithAsset[]>
  abstract store(metrics: IAssetMetricsAttr[]): Promise<void>
}

@provide(IAssetsMetricsRepository)
export class AssetsMetricsRepository implements IAssetsMetricsRepository {
  constructor(private readonly client: PrismaClient) {}

  findAll(): Promise<IAssetMetricsWithAsset[]> {
    return this.client.assetMetrics.findMany({
      where: { quantity: { gt: 0 } },
      include: { asset: true }
    })
  }

  async store(metrics: IAssetMetricsAttr[]): Promise<void> {
    await this.client.$transaction(
      metrics.map(data =>
        this.client.assetMetrics.upsert({
          where: { assetId: data.assetId },
          create: data,
          update: data
        })
      )
    )
  }
}
