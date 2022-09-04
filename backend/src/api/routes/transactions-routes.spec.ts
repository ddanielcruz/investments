import request from 'supertest'

import { PrismaClient, TransactionType } from '@prisma/client'

import { makeAsset, makeBroker, makeTransaction } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { IAsset, IBroker, ITransactionAttr } from '../../database/models'
import { api } from '../index'

let client: PrismaClient

const makeSut = () => {
  return request(api)
}

describe('/transactions', () => {
  let asset: IAsset
  let broker: IBroker
  let storeData: ITransactionAttr
  const txDate = new Date()

  beforeAll(async () => {
    client = await prisma.connect()
    asset = await client.asset.create({ data: makeAsset() })
    broker = await client.broker.create({ data: makeBroker() })
    storeData = {
      assetId: asset.id,
      brokerId: broker.id,
      unitPrice: 10,
      quantity: 1,
      fee: 0,
      date: txDate,
      type: TransactionType.Buy
    }
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
      const { body } = await makeSut().post('/transactions').send(storeData).expect(201)
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
        date: txDate.toISOString(),
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

  describe('PUT /:id', () => {
    it('updates a transaction', async () => {
      const { body: tx } = await makeSut().post('/transactions').send(storeData).expect(201)
      const response = await makeSut()
        .put(`/transactions/${tx.id}`)
        .send({ ...storeData, unitPrice: 100, fee: 2 })
        .expect(200)
      const foundTxs = await client.transaction.findMany()
      expect(response.body.id).toEqual(tx.id)
      expect(foundTxs).toHaveLength(1)
      expect(response.body).toEqual({
        id: tx.id,
        assetId: asset.id,
        brokerId: broker.id,
        unitPrice: 100,
        quantity: 1,
        fee: 2,
        date: txDate.toISOString(),
        type: TransactionType.Buy
      })
    })

    it('returns an error when received invalid data', async () => {
      const { body: tx } = await makeSut().post('/transactions').send(storeData).expect(201)
      await makeSut().put(`/transactions/${tx.id}`).send({}).expect(400)
      await makeSut().put(`/transactions/${tx.id}`).expect(400)
    })

    it('returns an error when transaction is not found', async () => {
      await makeSut().put('/transactions/100000').send(storeData).expect(404)
    })
  })

  describe('DELETE /:id', () => {
    it('deletes a transaction', async () => {
      const { body: tx } = await makeSut().post('/transactions').send(storeData).expect(201)
      await makeSut().delete(`/transactions/${tx.id}`).expect(204)
    })

    it('returns an error when transaction is not found', async () => {
      await makeSut().delete('/transactions/100000').expect(404)
    })
  })
})
