import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { IOperationsRepository } from '../../../database/repositories'
import { PROCESS_PORTFOLIO_METRICS } from '../../../queue/jobs/process-portfolio-metrics'
import { IQueueRepository } from '../../../queue/queue-repository'
import { NotFoundError } from '../../errors'

@injectable()
export abstract class IDeleteOperation {
  abstract execute(id: number): Promise<void>
}

@provide(IDeleteOperation)
export class DeleteOperation implements IDeleteOperation {
  constructor(
    private readonly operationsRepository: IOperationsRepository,
    private readonly queueRepository: IQueueRepository
  ) {}

  async execute(id: number): Promise<void> {
    const operation = await this.operationsRepository.delete(id)
    if (!operation) {
      throw new NotFoundError('Operation not found.')
    }

    await this.queueRepository.add(PROCESS_PORTFOLIO_METRICS)
  }
}
