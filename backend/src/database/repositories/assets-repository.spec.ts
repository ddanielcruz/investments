import { PrismaClient } from '@prisma/client'

import { makeAsset } from '../../../tests/factories'
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

  beforeEach(async () => {
    await client.asset.deleteMany()
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
