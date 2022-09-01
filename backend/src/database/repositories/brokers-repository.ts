import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { AssetType, PrismaClient } from '@prisma/client'

export interface IBroker {
  id: number
  name: string
  supportedTypes: AssetType[]
}

@injectable()
export abstract class IBrokersRepository {
  abstract findAll(): Promise<IBroker[]>
}

@provide(IBrokersRepository)
export class BrokersRepository implements IBrokersRepository {
  constructor(private readonly client: PrismaClient) {}

  findAll(): Promise<IBroker[]> {
    return this.client.broker.findMany({ orderBy: { name: 'asc' } })
  }
}
