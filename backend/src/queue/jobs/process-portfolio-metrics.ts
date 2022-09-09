import { provide } from 'inversify-binding-decorators'

import { logger } from '../../config/logger'
import { BaseJob } from './base-job'

export const PROCESS_PORTFOLIO_METRICS = 'PROCESS_PORTFOLIO_METRICS'

@provide(ProcessPortfolioMetrics)
export class ProcessPortfolioMetrics implements BaseJob {
  async execute(): Promise<void> {
    logger.info('Processing portfolio metrics')
  }
}
