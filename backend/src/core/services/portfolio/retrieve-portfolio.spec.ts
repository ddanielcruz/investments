import { AssetType } from '@prisma/client'

import { makeAsset, makeAssetMetrics } from '../../../../tests/factories'
import { makeAssetsMetricsRepository } from '../../../../tests/mocks/repositories'
import { IAssetMetricsWithAsset } from '../../../database/models'
import { RetrievePortfolio } from './retrieve-portfolio'

const assets = [makeAsset(), makeAsset(), makeAsset({ type: AssetType.Crypto })]
const metrics: IAssetMetricsWithAsset[] = [
  {
    ...makeAssetMetrics(assets[0].id, { totalEquity: 1200, totalInvested: 1000 }),
    asset: assets[0]
  },
  {
    ...makeAssetMetrics(assets[1].id, { totalEquity: 900, totalInvested: 1000 }),
    asset: assets[1]
  },
  { ...makeAssetMetrics(assets[2].id, { totalEquity: 600, totalInvested: 300 }), asset: assets[2] }
]

const makeSut = () => {
  const metricsRepoStub = makeAssetsMetricsRepository()
  const sut = new RetrievePortfolio(metricsRepoStub)
  jest.spyOn(metricsRepoStub, 'findAll').mockResolvedValue(metrics)

  return { sut, metricsRepoStub }
}

describe('RetrievePortfolio', () => {
  it('computes and retrieves current portfolio', async () => {
    const { sut } = makeSut()
    const portfolio = await sut.execute()
    expect(portfolio).toMatchObject({
      totalEquity: 2700,
      totalInvested: 2300,
      return: 400,
      returnPercentage: expect.closeTo(0.17, 0),
      groups: {
        stocks: {
          totalEquity: 2100,
          totalInvested: 2000,
          return: 100,
          returnPercentage: 0.05,
          share: expect.closeTo(0.77, 0),
          assets: [
            {
              ...metrics[0],
              groupShare: expect.closeTo(0.57, 0),
              share: expect.closeTo(0.44, 0)
            },
            {
              ...metrics[1],
              groupShare: expect.closeTo(0.42, 0),
              share: expect.closeTo(0.33, 0)
            }
          ]
        },
        crypto: {
          totalEquity: 600,
          totalInvested: 300,
          return: 300,
          returnPercentage: 1,
          share: expect.closeTo(0.22, 0),
          assets: [
            {
              ...metrics[2],
              groupShare: 1,
              share: expect.closeTo(0.22, 0)
            }
          ]
        },
        fixedIncome: {
          totalEquity: 0,
          totalInvested: 0,
          return: 0,
          returnPercentage: 0,
          share: 0,
          assets: []
        }
      }
    })
  })

  it('does not throw on empty portfolio', async () => {
    const { sut, metricsRepoStub } = makeSut()
    jest.spyOn(metricsRepoStub, 'findAll').mockResolvedValueOnce([])
    await sut.execute()
  })
})
