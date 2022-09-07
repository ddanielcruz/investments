import { Prisma, PrismaClient, TransactionType } from '@prisma/client'

import { makeAsset, makeBroker, makeTransaction } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { ITransactionAttr } from '../models'
import { TransactionsRepository } from './transactions-repository'

let client: PrismaClient

const makeSut = () => {
  return new TransactionsRepository(client)
}

const makeAssetAndBroker = async () => {
  return Promise.all([
    client.asset.create({ data: makeAsset() }),
    client.broker.create({ data: makeBroker() })
  ])
}

describe('TransactionsRepository', () => {
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

  describe('create', () => {
    it('creates a new transaction', async () => {
      const [asset, broker] = await makeAssetAndBroker()
      const data: ITransactionAttr = {
        assetId: asset.id,
        brokerId: broker.id,
        unitPrice: 10,
        quantity: 1,
        fee: 1,
        type: TransactionType.Buy,
        date: new Date()
      }
      const createdTx = await makeSut().create(data)
      const foundTxs = await client.transaction.findMany()
      expect(foundTxs).toHaveLength(1)
      expect(createdTx).toEqual(foundTxs[0])
    })
  })

  describe('delete', () => {
    it('deletes a transaction', async () => {
      const [asset, broker] = await makeAssetAndBroker()
      const tx = await client.transaction.create({ data: makeTransaction(asset.id, broker.id) })
      const deletedTx = await makeSut().delete(tx.id)
      const foundTxs = await client.transaction.findMany()
      expect(deletedTx).toBeTruthy()
      expect(foundTxs).toHaveLength(0)
    })

    it('returns null if transaction is not found', async () => {
      const transaction = await makeSut().delete(1)
      expect(transaction).toBeFalsy()
    })
  })

  describe('findAll', () => {
    it('finds all transactions with entities and sorted by date', async () => {
      const [assetA, brokerA] = await makeAssetAndBroker()
      const [assetB, brokerB] = await makeAssetAndBroker()
      const [txA, txB] = [
        makeTransaction(assetA.id, brokerA.id),
        makeTransaction(assetB.id, brokerB.id, { date: new Date(2000, 0) })
      ]
      await client.transaction.createMany({ data: [txA, txB] })
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
    const makeData = async (): Promise<ITransactionAttr> => {
      const [asset, broker] = await makeAssetAndBroker()
      return {
        assetId: asset.id,
        brokerId: broker.id,
        unitPrice: 10,
        quantity: 1,
        fee: 1,
        type: TransactionType.Buy,
        date: new Date()
      }
    }

    it('updates a transaction', async () => {
      const data = await makeData()
      const { id } = await client.transaction.create({ data })
      const updatedTx = await makeSut().update(id, { ...data, unitPrice: 20, fee: 0 })
      const foundTxs = await client.transaction.findMany()
      expect(updatedTx?.id).toEqual(id)
      expect(foundTxs).toHaveLength(1)
      expect(foundTxs[0]).toMatchObject({
        ...data,
        unitPrice: 20,
        quantity: 1,
        fee: 0
      })
    })

    it('returns null if transaction is not found', async () => {
      const data = await makeData()
      const transaction = await makeSut().update(1, data)
      expect(transaction).toBeFalsy()
    })
  })
})
