import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { PrismaClient } from '@prisma/client'

import { IOperation, IOperationAttr, IOperationWithEntities } from '../models'

@injectable()
export abstract class IOperationsRepository {
  abstract create(data: IOperationAttr): Promise<IOperation>
  abstract delete(id: number): Promise<IOperation | null>
  abstract findAll(): Promise<IOperationWithEntities[]>
  abstract update(id: number, data: IOperationAttr): Promise<IOperation | null>
}

@provide(IOperationsRepository)
export class OperationsRepository implements IOperationsRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(data: IOperationAttr): Promise<IOperation> {
    return await this.client.operation.create({ data })
  }

  async delete(id: number): Promise<IOperation | null> {
    try {
      return await this.client.operation.delete({ where: { id } })
    } catch (error) {
      return null
    }
  }

  async findAll(): Promise<IOperationWithEntities[]> {
    return await this.client.operation.findMany({
      include: { asset: true, broker: true },
      orderBy: { date: 'asc' }
    })
  }

  async update(id: number, data: IOperationAttr): Promise<IOperation | null> {
    try {
      return await this.client.operation.update({ where: { id }, data })
    } catch (error) {
      return null
    }
  }
}
