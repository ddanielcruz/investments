import request from 'supertest'

import { AssetType, PrismaClient } from '@prisma/client'

import { makeAsset, makeAssetMetrics } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { IAssetMetricsAttr } from '../../database/models'
import { api } from '../index'

let client: PrismaClient

const makeSut = () => {
  return request(api)
}

describe('/portfolio', () => {
  beforeAll(async () => {
    client = await prisma.connect()
  })

  afterEach(async () => {
    await client.asset.deleteMany()
  })

  afterAll(async () => {
    await prisma.disconnect()
  })

  describe('GET /', () => {
    const assets = [
      makeAsset({ name: 'stock-asset' }),
      makeAsset({ name: 'crypto-asset', type: AssetType.Crypto })
    ]
    const metrics = [makeAssetMetrics(assets[0].id), makeAssetMetrics(assets[1].id)]

    it('retrieve latest portfolio', async () => {
      await client.$transaction([
        client.asset.createMany({ data: assets }),
        client.assetMetrics.createMany({ data: metrics })
      ])
      const response = await makeSut().get('/portfolio').expect(200)
      expect(response.body).toBeTruthy()
    })
  })
})
