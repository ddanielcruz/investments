import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { ITransactionsRepository } from '../../../database/repositories'
import { NotFoundError } from '../../errors'

@injectable()
export abstract class IDeleteTransaction {
  abstract execute(id: number): Promise<void>
}

@provide(IDeleteTransaction)
export class DeleteTransaction implements IDeleteTransaction {
  constructor(private readonly transactionsRepository: ITransactionsRepository) {}

  async execute(id: number): Promise<void> {
    const transaction = await this.transactionsRepository.delete(id)
    if (!transaction) {
      throw new NotFoundError('Transaction not found.')
    }
  }
}
