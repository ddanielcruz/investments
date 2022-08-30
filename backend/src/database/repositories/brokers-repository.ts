import { AssetType, PrismaClient } from '@prisma/client'

export interface IBroker {
  id: number
  name: string
  supportedTypes: AssetType[]
}

export interface IBrokersRepository {
  findAll(): Promise<IBroker[]>
}

export class BrokersRepository implements IBrokersRepository {
  constructor(private readonly client: PrismaClient) {}

  findAll(): Promise<IBroker[]> {
    return this.client.broker.findMany({ orderBy: { name: 'asc' } })
  }
}
