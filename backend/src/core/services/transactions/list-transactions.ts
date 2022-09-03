import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { ITransactionWithEntities } from '../../../database/models'
import { ITransactionsRepository } from '../../../database/repositories'

@injectable()
export abstract class IListTransactions {
  abstract execute(): Promise<ITransactionWithEntities[]>
}

@provide(IListTransactions)
export class ListTransactions implements IListTransactions {
  constructor(private readonly transactionsRepository: ITransactionsRepository) {}

  execute(): Promise<ITransactionWithEntities[]> {
    return this.transactionsRepository.findAll()
  }
}
