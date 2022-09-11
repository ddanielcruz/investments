import { Queue } from 'bullmq'
import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

export interface IJobOptions {
  delay?: number
  attempts?: number
  priority?: number
}

@injectable()
export abstract class IQueueRepository {
  abstract add<T = any>(job: string, data?: T, options?: IJobOptions): Promise<void>
}

@provide(IQueueRepository)
export class QueueRepository implements IQueueRepository {
  constructor(private readonly queue: Queue) {}

  async add<T = any>(job: string, data?: T, options?: IJobOptions): Promise<void> {
    await this.queue.add(job, data, options)
  }
}
