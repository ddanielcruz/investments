import { Prisma, PrismaClient, OperationType } from '@prisma/client'

import { makeAsset, makeBroker, makeOperation } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { IOperationAttr } from '../models'
import { OperationsRepository } from './operations-repository'

let client: PrismaClient

const makeSut = () => {
  return new OperationsRepository(client)
}

const makeAssetAndBroker = async () => {
  return Promise.all([
    client.asset.create({ data: makeAsset() }),
    client.broker.create({ data: makeBroker() })
  ])
}

describe('OperationsRepository', () => {
  beforeAll(async () => {
    client = await prisma.connect()
  })

  beforeEach(async () => {
    await client.$transaction([
      client.operation.deleteMany(),
      client.broker.deleteMany(),
      client.asset.deleteMany()
    ])
  })

  afterAll(async () => {
    await prisma.disconnect()
  })

  describe('create', () => {
    it('creates a new operation', async () => {
      const [asset, broker] = await makeAssetAndBroker()
      const data: IOperationAttr = {
        assetId: asset.id,
        brokerId: broker.id,
        unitPrice: 10,
        quantity: 1,
        fee: 1,
        type: OperationType.Buy,
        date: new Date()
      }
      const createdTx = await makeSut().create(data)
      const foundTxs = await client.operation.findMany()
      expect(foundTxs).toHaveLength(1)
      expect(createdTx).toEqual(foundTxs[0])
    })
  })

  describe('delete', () => {
    it('deletes a operation', async () => {
      const [asset, broker] = await makeAssetAndBroker()
      const tx = await client.operation.create({ data: makeOperation(asset.id, broker.id) })
      const deletedTx = await makeSut().delete(tx.id)
      const foundTxs = await client.operation.findMany()
      expect(deletedTx).toBeTruthy()
      expect(foundTxs).toHaveLength(0)
    })

    it('returns null if operation is not found', async () => {
      const operation = await makeSut().delete(1)
      expect(operation).toBeFalsy()
    })
  })

  describe('findAll', () => {
    it('finds all operations with entities and sorted by date', async () => {
      const [assetA, brokerA] = await makeAssetAndBroker()
      const [assetB, brokerB] = await makeAssetAndBroker()
      const [txA, txB] = [
        makeOperation(assetA.id, brokerA.id),
        makeOperation(assetB.id, brokerB.id, { date: new Date(2000, 0) })
      ]
      await client.operation.createMany({ data: [txA, txB] })
      const foundTxs = await makeSut().findAll()
      expect(foundTxs[0]).toEqual({
        ...txB,
        asset: assetB,
        broker: brokerB
      })
      expect(foundTxs[1]).toEqual({
        ...txA,
        asset: assetA,
        broker: brokerA
      })
    })
  })

  describe('update', () => {
    const makeData = async (): Promise<IOperationAttr> => {
      const [asset, broker] = await makeAssetAndBroker()
      return {
        assetId: asset.id,
        brokerId: broker.id,
        unitPrice: 10,
        quantity: 1,
        fee: 1,
        type: OperationType.Buy,
        date: new Date()
      }
    }

    it('updates a operation', async () => {
      const data = await makeData()
      const { id } = await client.operation.create({ data })
      const updatedTx = await makeSut().update(id, { ...data, unitPrice: 20, fee: 0 })
      const foundTxs = await client.operation.findMany()
      expect(updatedTx?.id).toEqual(id)
      expect(foundTxs).toHaveLength(1)
      expect(foundTxs[0]).toMatchObject({
        ...data,
        unitPrice: 20,
        quantity: 1,
        fee: 0
      })
    })

    it('returns null if operation is not found', async () => {
      const data = await makeData()
      const operation = await makeSut().update(1, data)
      expect(operation).toBeFalsy()
    })
  })
})
