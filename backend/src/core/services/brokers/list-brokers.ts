import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { IBroker, IBrokersRepository } from '../../../database/repositories'

@injectable()
export abstract class IListBrokers {
  abstract execute(): Promise<IBroker[]>
}

@provide(IListBrokers)
export class ListBrokers implements IListBrokers {
  constructor(private readonly brokersRepository: IBrokersRepository) {}

  execute(): Promise<IBroker[]> {
    return this.brokersRepository.findAll()
  }
}
