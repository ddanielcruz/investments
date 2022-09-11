import { Queue } from 'bullmq'
import Redis from 'ioredis'
import request from 'supertest'

import { PrismaClient, OperationType } from '@prisma/client'

import { makeAsset, makeBroker, makeOperation } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { container } from '../../config/container'
import { IAsset, IBroker, IOperationAttr } from '../../database/models'
import { api } from '../index'

let client: PrismaClient
let redis: Redis
let queue: Queue

const makeSut = () => {
  return request(api)
}

describe('/operations', () => {
  let asset: IAsset
  let broker: IBroker
  let storeData: IOperationAttr
  const txDate = new Date()

  beforeAll(async () => {
    client = await prisma.connect()
    redis = container.get(Redis)
    queue = container.get(Queue)
    asset = await client.asset.create({ data: makeAsset() })
    broker = await client.broker.create({ data: makeBroker() })
    storeData = {
      assetId: asset.id,
      brokerId: broker.id,
      unitPrice: 10,
      quantity: 1,
      fee: 0,
      date: txDate,
      type: OperationType.Buy
    }
  })

  afterEach(async () => {
    await client.operation.deleteMany()
    await queue.drain(true)
  })

  afterAll(async () => {
    await client.$transaction([client.broker.deleteMany(), client.asset.deleteMany()])
    await prisma.disconnect()
    await queue.close()
    await queue.disconnect()
  })

  describe('GET /', () => {
    it('lists all operations', async () => {
      await client.operation.create({ data: makeOperation(asset.id, broker.id) })
      const { body } = await makeSut().get('/operations').expect(200)
      expect(body).toHaveLength(1)
    })
  })

  describe('POST /', () => {
    it('creates a new operation', async () => {
      const { body } = await makeSut().post('/operations').send(storeData).expect(201)
      const foundTxs = await client.operation.findMany()
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
        type: OperationType.Buy
      })
    })

    it('returns an error when received invalid data', async () => {
      await makeSut().post('/operations').send({}).expect(400)
      await makeSut().post('/operations').expect(400)
      const foundTxs = await client.operation.findMany()
      expect(foundTxs).toHaveLength(0)
    })
  })

  describe('PUT /:id', () => {
    it('updates a operation', async () => {
      const { body: tx } = await makeSut().post('/operations').send(storeData).expect(201)
      const response = await makeSut()
        .put(`/operations/${tx.id}`)
        .send({ ...storeData, unitPrice: 100, fee: 2 })
        .expect(200)
      const foundTxs = await client.operation.findMany()
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
        type: OperationType.Buy
      })
    })

    it('returns an error when received invalid data', async () => {
      const { body: tx } = await makeSut().post('/operations').send(storeData).expect(201)
      await makeSut().put(`/operations/${tx.id}`).send({}).expect(400)
      await makeSut().put(`/operations/${tx.id}`).expect(400)
    })

    it('returns an error when operation is not found', async () => {
      await makeSut().put('/operations/100000').send(storeData).expect(404)
    })
  })

  describe('DELETE /:id', () => {
    it('deletes a operation', async () => {
      const { body: tx } = await makeSut().post('/operations').send(storeData).expect(201)
      await makeSut().delete(`/operations/${tx.id}`).expect(204)
    })

    it('returns an error when operation is not found', async () => {
      await makeSut().delete('/operations/100000').expect(404)
    })
  })
})
