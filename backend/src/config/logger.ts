import { transports, createLogger, format } from 'winston'

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'

export const logger = createLogger({
  level: isDev ? 'debug' : 'http',
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(info => `[${[info.timestamp]}] ${info.level}: ${info.message}`)
  ),
  silent: process.env.NODE_ENV === 'test'
})
