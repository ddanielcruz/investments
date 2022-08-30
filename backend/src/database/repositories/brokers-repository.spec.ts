import { PrismaClient } from '@prisma/client'

import { makeBroker } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { BrokersRepository } from './brokers-repository'

let client: PrismaClient

const makeSut = () => {
  return new BrokersRepository(client)
}

describe('BrokersRepository', () => {
  beforeAll(async () => {
    client = await prisma.connect()
  })

  beforeEach(async () => {
    await client.broker.deleteMany()
  })

  afterAll(async () => {
    await prisma.disconnect()
  })

  describe('findAll', () => {
    it('finds all brokers', async () => {
      const createdBroker = await client.broker.create({ data: makeBroker() })
      const brokers = await makeSut().findAll()
      expect(brokers).toEqual([createdBroker])
    })
  })
})
