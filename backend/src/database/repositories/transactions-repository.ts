import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { PrismaClient } from '@prisma/client'

import { ITransaction, ITransactionAttr, ITransactionWithEntities } from '../models'

@injectable()
export abstract class ITransactionsRepository {
  abstract create(data: ITransactionAttr): Promise<ITransaction>
  abstract delete(id: number): Promise<ITransaction | null>
  abstract findAll(): Promise<ITransactionWithEntities[]>
  abstract update(id: number, data: ITransactionAttr): Promise<ITransaction | null>
}

@provide(ITransactionsRepository)
export class TransactionsRepository implements ITransactionsRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(data: ITransactionAttr): Promise<ITransaction> {
    return await this.client.transaction.create({ data })
  }

  async delete(id: number): Promise<ITransaction | null> {
    try {
      return await this.client.transaction.delete({ where: { id } })
    } catch (error) {
      return null
    }
  }

  async findAll(): Promise<ITransactionWithEntities[]> {
    return await this.client.transaction.findMany({
      include: { asset: true, broker: true },
      orderBy: { date: 'asc' }
    })
  }

  async update(id: number, data: ITransactionAttr): Promise<ITransaction | null> {
    try {
      return await this.client.transaction.update({ where: { id }, data })
    } catch (error) {
      return null
    }
  }
}
