import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { PrismaClient, Transaction } from '@prisma/client'

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
    const transaction = await this.client.transaction.create({ data })
    return this.normalize(transaction)
  }

  async delete(id: number): Promise<ITransaction | null> {
    try {
      const transaction = await this.client.transaction.delete({ where: { id } })
      return this.normalize(transaction)
    } catch (error) {
      return null
    }
  }

  async findAll(): Promise<ITransactionWithEntities[]> {
    const transactions = await this.client.transaction.findMany({
      include: { asset: true, broker: true },
      orderBy: { date: 'asc' }
    })

    return transactions.map(({ asset, broker, ...transaction }) => ({
      ...this.normalize(transaction),
      asset,
      broker
    }))
  }

  async update(id: number, data: ITransactionAttr): Promise<ITransaction | null> {
    try {
      const transaction = await this.client.transaction.update({ where: { id }, data })
      return this.normalize(transaction)
    } catch (error) {
      return null
    }
  }

  private normalize(transaction: Transaction): ITransaction {
    return {
      ...transaction,
      unitPrice: transaction.unitPrice.toNumber(),
      quantity: transaction.quantity.toNumber(),
      fee: transaction.fee.toNumber()
    }
  }
}
