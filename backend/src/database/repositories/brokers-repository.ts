import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { PrismaClient } from '@prisma/client'

import { IBroker } from '../models'

@injectable()
export abstract class IBrokersRepository {
  abstract findAll(): Promise<IBroker[]>
  abstract findById(id: number): Promise<IBroker | null>
}

@provide(IBrokersRepository)
export class BrokersRepository implements IBrokersRepository {
  constructor(private readonly client: PrismaClient) {}

  findAll(): Promise<IBroker[]> {
    return this.client.broker.findMany({ orderBy: { name: 'asc' } })
  }

  findById(id: number): Promise<IBroker | null> {
    return this.client.broker.findUnique({ where: { id } })
  }
}
