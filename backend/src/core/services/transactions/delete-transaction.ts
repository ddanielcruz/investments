import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { ITransactionsRepository } from '../../../database/repositories'
import { PROCESS_PORTFOLIO_METRICS } from '../../../queue/jobs/process-portfolio-metrics'
import { IQueueRepository } from '../../../queue/queue-repository'
import { NotFoundError } from '../../errors'

@injectable()
export abstract class IDeleteTransaction {
  abstract execute(id: number): Promise<void>
}

@provide(IDeleteTransaction)
export class DeleteTransaction implements IDeleteTransaction {
  constructor(
    private readonly transactionsRepository: ITransactionsRepository,
    private readonly queueRepository: IQueueRepository
  ) {}

  async execute(id: number): Promise<void> {
    const transaction = await this.transactionsRepository.delete(id)
    if (!transaction) {
      throw new NotFoundError('Transaction not found.')
    }

    await this.queueRepository.add(PROCESS_PORTFOLIO_METRICS)
  }
}
