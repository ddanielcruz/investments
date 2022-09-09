export interface BaseJob<T = unknown> {
  execute(data?: T): Promise<void>
}
