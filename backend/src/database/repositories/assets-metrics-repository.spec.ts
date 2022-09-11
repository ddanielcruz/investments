import { PrismaClient } from '@prisma/client'

import { makeAsset, makeAssetMetrics } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { AssetsMetricsRepository } from './assets-metrics-repository'

let client: PrismaClient

const makeSut = () => {
  return new AssetsMetricsRepository(client)
}

describe('AssetsMetricsRepository', () => {
  beforeAll(async () => {
    client = await prisma.connect()
  })

  afterEach(async () => {
    await client.asset.deleteMany()
  })

  afterAll(async () => {
    await prisma.disconnect()
  })

  describe('findAll', () => {
    it('finds all metrics with assets', async () => {
      const assets = await Promise.all([
        client.asset.create({ data: makeAsset() }),
        client.asset.create({ data: makeAsset() })
      ])
      await client.assetMetrics.createMany({
        data: [makeAssetMetrics(assets[0].id), makeAssetMetrics(assets[1].id)]
      })
      const metrics = await makeSut().findAll()
      expect(metrics).toHaveLength(2)
      expect(metrics).toMatchObject([
        { assetId: assets[0].id, asset: assets[0] },
        { assetId: assets[1].id, asset: assets[1] }
      ])
    })
  })

  describe('store', () => {
    it('upsert many assets metrics', async () => {
      const assets = await Promise.all([
        client.asset.create({ data: makeAsset() }),
        client.asset.create({ data: makeAsset() }),
        client.asset.create({ data: makeAsset() })
      ])
      await client.assetMetrics.create({
        data: makeAssetMetrics(assets[0].id, { averagePrice: 100, marketPrice: 100 })
      })
      const metricsData = assets.map(asset => makeAssetMetrics(asset.id))
      await makeSut().store(metricsData)
      const metrics = await client.assetMetrics.findMany()
      expect(metrics).toHaveLength(3)
      expect(metrics).toMatchObject(metricsData)
    })
  })
})
