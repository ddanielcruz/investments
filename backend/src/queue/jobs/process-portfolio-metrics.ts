import { provide } from 'inversify-binding-decorators'

import { OperationType } from '@prisma/client'

import { logger } from '../../config/logger'
import { IQueryAssetsQuotes } from '../../core/services/assets/query-assets-quotes'
import { IAssetMetrics } from '../../database/models'
import {
  IAssetsMetricsRepository,
  IAssetsRepository,
  IOperationsRepository
} from '../../database/repositories'
import { BaseJob } from './base-job'

export const PROCESS_PORTFOLIO_METRICS = 'PROCESS_PORTFOLIO_METRICS'

interface IMetricsMap {
  [id: number]: Partial<IAssetMetrics>
}

interface IOperationsMap {
  [id: number]: {
    quantity: number
    totalInvested: number
    totalBuys: number
    quantityBuys: number
  }
}

@provide(ProcessPortfolioMetrics)
export class ProcessPortfolioMetrics implements BaseJob {
  constructor(
    private readonly assetsRepository: IAssetsRepository,
    private readonly operationsRepository: IOperationsRepository,
    private readonly metricsRepository: IAssetsMetricsRepository,
    private readonly queryAssetsQuotes: IQueryAssetsQuotes
  ) {}

  async execute(): Promise<void> {
    logger.info('Processing portfolio metrics')

    // Load all invested assets and get their current quotes
    const assets = await this.assetsRepository.findInvested()
    const quotes = await this.queryAssetsQuotes.execute(assets)
    const metricsMap = quotes.reduce<IMetricsMap>((map, asset) => {
      return { ...map, [asset.id]: { assetId: asset.id, marketPrice: asset.price } }
    }, {})
    // Load all operations and calculate missing metrics
    const operationsSummary = await this.summarizeOperations()
    for (const assetId in operationsSummary) {
      const { quantity, totalInvested, totalBuys, quantityBuys } = operationsSummary[assetId]
      const totalEquity = metricsMap[assetId].marketPrice! * quantity
      const averagePrice = totalBuys / quantityBuys
      const returnVal = totalEquity - totalInvested
      const returnPercentage = returnVal / totalInvested
      Object.assign(metricsMap[assetId], {
        quantity,
        totalInvested,
        totalEquity,
        averagePrice,
        return: returnVal,
        returnPercentage
      })
    }

    logger.info(`Storing metrics for ${assets.length} assets`)
    await this.metricsRepository.store(Object.values(metricsMap))
  }

  private async summarizeOperations(): Promise<IOperationsMap> {
    const operations = await this.operationsRepository.findAll()
    return operations.reduce<IOperationsMap>((map, { assetId, quantity, unitPrice, type }) => {
      if (!map[assetId]) {
        map[assetId] = { quantity: 0, totalInvested: 0, totalBuys: 0, quantityBuys: 0 }
      }

      const operationTotal = unitPrice * quantity
      if (type === OperationType.Buy) {
        map[assetId].totalInvested += operationTotal
        map[assetId].totalBuys += operationTotal
        map[assetId].quantity += quantity
        map[assetId].quantityBuys += quantity
      } else if (OperationType.Sell) {
        map[assetId].quantity -= quantity
        map[assetId].totalInvested -= operationTotal
      }

      return map
    }, {})
  }
}
