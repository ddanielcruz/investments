import request from 'supertest'

import { PrismaClient, TransactionType } from '@prisma/client'

import { makeAsset, makeBroker, makeTransaction } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { api } from '../index'

let client: PrismaClient

const makeSut = () => {
  return request(api)
}

describe('/transactions', () => {
  beforeAll(async () => {
    client = await prisma.connect()
  })

  beforeEach(async () => {
    await client.$transaction([
      client.transaction.deleteMany(),
      client.broker.deleteMany(),
      client.asset.deleteMany()
    ])
  })

  afterAll(async () => {
    await prisma.disconnect()
  })

  describe('POST /', () => {
    it('creates a new transaction', async () => {
      const asset = await client.asset.create({ data: makeAsset() })
      const broker = await client.broker.create({ data: makeBroker() })
      const date = new Date()
      const { body } = await makeSut()
        .post('/transactions')
        .send({
          assetId: asset.id,
          brokerId: broker.id,
          unitPrice: 10,
          quantity: 1,
          fee: 0,
          date,
          type: TransactionType.Buy
        })
        .expect(201)
      const foundTxs = await client.transaction.findMany()
      expect(foundTxs).toHaveLength(1)
      expect(body.id).toBe(foundTxs[0].id)
      expect(body).toEqual({
        id: expect.any(Number),
        assetId: asset.id,
        brokerId: broker.id,
        unitPrice: 10,
        quantity: 1,
        fee: 0,
        date: date.toISOString(),
        type: TransactionType.Buy
      })
    })

    it('returns an error when received invalid data', async () => {
      await makeSut().post('/transactions').send({}).expect(400)
      await makeSut().post('/transactions').expect(400)
      const foundTxs = await client.transaction.findMany()
      expect(foundTxs).toHaveLength(0)
    })
  })
})
