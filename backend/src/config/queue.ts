export interface QueueConfig {
  name: string
  concurrency: number
}

export const config: QueueConfig = {
  name: process.env.QUEUE_NAME || 'Investments',
  concurrency: Number(process.env.QUEUE_CONCURRENCY) || 2
}
