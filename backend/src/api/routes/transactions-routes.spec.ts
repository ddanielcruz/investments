import request from 'supertest'

import { PrismaClient, TransactionType } from '@prisma/client'

import { makeAsset, makeBroker, makeTransaction } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { IAsset, IBroker } from '../../database/models'
import { api } from '../index'

let client: PrismaClient

const makeSut = () => {
  return request(api)
}

describe('/transactions', () => {
  let asset: IAsset
  let broker: IBroker

  beforeAll(async () => {
    client = await prisma.connect()
    asset = await client.asset.create({ data: makeAsset() })
    broker = await client.broker.create({ data: makeBroker() })
  })

  afterEach(async () => {
    await client.transaction.deleteMany()
  })

  afterAll(async () => {
    await client.$transaction([client.broker.deleteMany(), client.asset.deleteMany()])
    await prisma.disconnect()
  })

  describe('GET /', () => {
    it('lists all transactions', async () => {
      await client.transaction.create({ data: makeTransaction(asset.id, broker.id) })
      const { body } = await makeSut().get('/transactions').expect(200)
      expect(body).toHaveLength(1)
    })
  })

  describe('POST /', () => {
    it('creates a new transaction', async () => {
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
