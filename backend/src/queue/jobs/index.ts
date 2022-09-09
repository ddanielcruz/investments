import { container } from '../../config/container'
import { BaseJob } from './base-job'
import { ProcessPortfolioMetrics, PROCESS_PORTFOLIO_METRICS } from './process-portfolio-metrics'

interface JobMapping {
  [key: string]: BaseJob
}

export function resolveJobs(): JobMapping {
  return {
    [PROCESS_PORTFOLIO_METRICS]: container.resolve(ProcessPortfolioMetrics)
  }
}
