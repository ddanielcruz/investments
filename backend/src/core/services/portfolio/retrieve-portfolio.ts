import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { AssetType } from '@prisma/client'

import { IAssetMetricsWithAsset as IMetrics } from '../../../database/models'
import { IAssetsMetricsRepository } from '../../../database/repositories'

interface IPortfolioAsset extends Omit<IMetrics, 'assetId'> {
  groupShare: number
  share: number
}

interface IPortfolioGroup {
  totalEquity: number
  totalInvested: number
  share: number
  return: number
  returnPercentage: number
  assets: IPortfolioAsset[]
}

export interface IPortfolio extends Omit<IPortfolioGroup, 'assets' | 'share'> {
  groups: {
    stocks: IPortfolioGroup
    crypto: IPortfolioGroup
    fixedIncome: IPortfolioGroup
  }
}

interface IGroupMetrics {
  totalEquity: number
  totalInvested: number
  metrics: IMetrics[]
}

@injectable()
export abstract class IRetrievePortfolio {
  abstract execute(): Promise<IPortfolio>
}

@provide(IRetrievePortfolio)
export class RetrievePortfolio implements IRetrievePortfolio {
  constructor(private readonly metricsRepository: IAssetsMetricsRepository) {}

  async execute(): Promise<IPortfolio> {
    // Load all metrics previously calculated by job
    const metrics = await this.metricsRepository.findAll()

    // Group assets by groups and calculate total equities and invested amounts
    const [totalEquity, totalInvested, byGroup] = this.groupMetrics(metrics)

    // Compute group and overall portfolio metrics
    const returnVal = totalEquity - totalInvested

    return {
      totalEquity,
      totalInvested,
      return: returnVal,
      returnPercentage: totalInvested !== 0 ? returnVal / totalInvested : 0,
      groups: {
        stocks: this.computeGroup(byGroup[AssetType.Stock], totalEquity),
        crypto: this.computeGroup(byGroup[AssetType.Crypto], totalEquity),
        fixedIncome: this.computeGroup(byGroup[AssetType.FixedIncome], totalEquity)
      }
    }
  }

  private groupMetrics(metrics: IMetrics[]): [number, number, { [group: string]: IGroupMetrics }] {
    let totalEquity = 0
    let totalInvested = 0
    const byGroup = metrics.reduce<{ [group: string]: IGroupMetrics }>((map, metric) => {
      const { type } = metric.asset
      if (!map[type]) {
        map[type] = { totalEquity: 0, totalInvested: 0, metrics: [] }
      }

      map[type].metrics.push(metric)
      totalEquity += metric.totalEquity
      map[type].totalEquity += metric.totalEquity
      totalInvested += metric.totalInvested
      map[type].totalInvested += metric.totalInvested

      return map
    }, {})

    return [totalEquity, totalInvested, byGroup]
  }

  private computeGroup(
    groupMetrics: IGroupMetrics | undefined,
    overallEquity: number
  ): IPortfolioGroup {
    const { metrics = [], totalEquity = 0, totalInvested = 0 } = groupMetrics || {}
    const returnVal = totalEquity - totalInvested

    return {
      totalEquity,
      totalInvested,
      return: returnVal,
      returnPercentage: totalInvested !== 0 ? returnVal / totalInvested : 0,
      share: overallEquity !== 0 ? totalEquity / overallEquity : 0,
      assets: metrics.map(metric => {
        return {
          ...metric,
          groupShare: metric.totalEquity / totalEquity,
          share: metric.totalEquity / overallEquity
        }
      })
    }
  }
}
