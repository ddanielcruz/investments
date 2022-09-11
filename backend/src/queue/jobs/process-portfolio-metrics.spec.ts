import { OperationType } from '@prisma/client'

import { makeAsset, makeAssetSymbol, makeOperation } from '../../../tests/factories'
import {
  makeAssetsMetricsRepository,
  makeAssetsRepository,
  makeOperationsRepository
} from '../../../tests/mocks/repositories'
import { IAssetQuote, IQueryAssetsQuotes } from '../../core/services/assets/query-assets-quotes'
import { IAssetWithSymbols } from '../../database/models'
import { ProcessPortfolioMetrics } from './process-portfolio-metrics'

const assetA: IAssetWithSymbols = { ...makeAsset(), symbols: [makeAssetSymbol()] }
const assetB: IAssetWithSymbols = { ...makeAsset(), symbols: [makeAssetSymbol()] }
const operations = [
  makeOperation(assetA.id, 1, { unitPrice: 90, quantity: 10 }),
  makeOperation(assetA.id, 1, { unitPrice: 95, quantity: 10 }),
  makeOperation(assetB.id, 2, { unitPrice: 30, quantity: 5 }),
  makeOperation(assetA.id, 1, { unitPrice: 100, quantity: 5, type: OperationType.Sell })
]

const makeQueryAssetsQuotes = (): IQueryAssetsQuotes => {
  class QueryAssetsQuotesStub implements IQueryAssetsQuotes {
    async execute(): Promise<IAssetQuote[]> {
      return [
        { ...assetA, price: 100 },
        { ...assetB, price: 27 }
      ]
    }
  }
  return new QueryAssetsQuotesStub()
}

const makeSut = () => {
  const assetsRepoStub = makeAssetsRepository()
  const opRepoStub = makeOperationsRepository()
  const metricsRepoStub = makeAssetsMetricsRepository()
  const queryAssetsQuotesStub = makeQueryAssetsQuotes()
  const sut = new ProcessPortfolioMetrics(
    assetsRepoStub,
    opRepoStub,
    metricsRepoStub,
    queryAssetsQuotesStub
  )
  jest.spyOn(assetsRepoStub, 'findInvested').mockResolvedValue([assetA, assetB])
  jest.spyOn(opRepoStub, 'findAll').mockResolvedValue(operations as any)

  return {
    sut,
    assetsRepoStub,
    opRepoStub,
    metricsRepoStub,
    queryAssetsQuotesStub
  }
}

describe('ProcessPortfolioMetrics', () => {
  it('finds quotes of all invested assets', async () => {
    const { sut, queryAssetsQuotesStub } = makeSut()
    const executeSpy = jest.spyOn(queryAssetsQuotesStub, 'execute')
    await sut.execute()
    expect(executeSpy).toHaveBeenCalledWith([assetA, assetB])
  })

  it('summarizes and stores assets metrics', async () => {
    const { sut, metricsRepoStub } = makeSut()
    const storeSpy = jest.spyOn(metricsRepoStub, 'store')
    await sut.execute()
    const expectedMetrics = {
      [assetA.id]: {
        assetId: assetA.id,
        marketPrice: 100,
        quantity: 15,
        totalInvested: 1350,
        totalEquity: 1500,
        averagePrice: 92.5,
        return: 150,
        returnPercentage: expect.closeTo(0.11)
      },
      [assetB.id]: {
        assetId: assetB.id,
        marketPrice: 27,
        quantity: 5,
        totalInvested: 150,
        totalEquity: 135,
        averagePrice: 30,
        return: -15,
        returnPercentage: expect.closeTo(-0.1)
      }
    }
    expect(storeSpy).toHaveBeenCalledWith(Object.values(expectedMetrics))
  })
})
