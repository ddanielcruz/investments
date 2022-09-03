import request from 'supertest'

import { PrismaClient } from '@prisma/client'

import { makeAsset } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { api } from '../index'

let client: PrismaClient

const makeSut = () => {
  return request(api)
}

describe('/assets', () => {
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
      makeAsset({ name: 'any-asset' }),
      makeAsset({ name: 'other-asset' }),
      makeAsset({ name: 'random-name' })
    ]

    it('searches available assets', async () => {
      await client.asset.createMany({ data: assets })
      await makeSut().get('/assets').expect(200, assets)
    })

    it('filters available assets', async () => {
      await client.asset.createMany({ data: assets })
      await makeSut().get('/assets?query=asset').expect(200, [assets[0], assets[1]])
    })
  })
})
