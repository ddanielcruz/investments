import request from 'supertest'

import { PrismaClient } from '@prisma/client'

import { makeBroker } from '../../../tests/factories'
import prisma from '../../../tests/prisma'
import { api } from '../index'

let client: PrismaClient

const makeSut = () => {
  return request(api)
}

describe('/brokers', () => {
  beforeAll(async () => {
    client = await prisma.connect()
  })

  afterEach(async () => {
    await client.broker.deleteMany()
  })

  afterAll(async () => {
    await prisma.disconnect()
  })

  describe('GET /', () => {
    const brokers = [makeBroker(), makeBroker()]

    it('lists available brokers', async () => {
      await client.broker.createMany({ data: brokers })
      await makeSut()
        .get('/brokers')
        .expect(
          200,
          brokers.sort((a, b) => (a.name > b.name ? 1 : -1))
        )
    })
  })
})
