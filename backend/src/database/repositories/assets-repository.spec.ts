import { PrismaClient, TransactionType } from '@prisma/client'

import { makeAsset, makeBroker, makeTransaction } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { AssetsRepository } from './assets-repository'

let client: PrismaClient

const makeSut = () => {
  return new AssetsRepository(client)
}

describe('Assets', () => {
  beforeAll(async () => {
    client = await prisma.connect()
  })

  afterEach(async () => {
    await client.$transaction([client.transaction.deleteMany(), client.asset.deleteMany()])
  })

  afterAll(async () => {
    await prisma.disconnect()
  })

  describe('findById', () => {
    it('finds an asset', async () => {
      const createdAsset = await client.asset.create({ data: makeAsset() })
      const foundAsset = await makeSut().findById(createdAsset.id)
      expect(foundAsset).toMatchObject(createdAsset)
    })

    it('returns null when not found', async () => {
      const foundAsset = await makeSut().findById(0)
      expect(foundAsset).toBeFalsy()
    })
  })

  describe('findInvested', () => {
    it('finds all invested assets', async () => {
      const [assetA, assetB, assetC] = await Promise.all([
        client.asset.create({ data: makeAsset() }),
        client.asset.create({ data: makeAsset() }),
        client.asset.create({ data: makeAsset() })
      ])
      const broker = await client.broker.create({ data: makeBroker() })
      await client.transaction.createMany({
        data: [
          makeTransaction(assetA.id, broker.id),
          makeTransaction(assetA.id, broker.id),
          makeTransaction(assetB.id, broker.id, { type: TransactionType.Sell }),
          makeTransaction(assetC.id, broker.id),
          makeTransaction(assetA.id, broker.id),
          makeTransaction(assetC.id, broker.id)
        ]
      })
      const assetsIds = (await makeSut().findInvested()).map(asset => asset.id).sort()
      expect(assetsIds).toHaveLength(3)
      expect(assetsIds).toEqual([assetA.id, assetB.id, assetC.id].sort())
    })
  })

  describe('findMany', () => {
    it('finds all assets', async () => {
      await client.asset.createMany({ data: [makeAsset(), makeAsset()] })
      const assets = await makeSut().findMany('')
      expect(assets).toHaveLength(2)
    })

    it('finds assets that match name and/or ticker', async () => {
      const createdAssets = [
        makeAsset({ name: 'some-name-1' }),
        makeAsset({ ticker: 'SOME-TICKER-2' }),
        makeAsset({ name: 'SOME-TICKER-3', ticker: 'some-ticker-3' }),
        makeAsset({ name: 'other-name-4' })
      ]
      await client.asset.createMany({ data: createdAssets })
      const foundAssets = await makeSut().findMany('some')
      expect(foundAssets).toEqual(
        createdAssets.slice(0, 3).sort((a, b) => (a.name > b.name ? 1 : -1))
      )
    })
  })
})
