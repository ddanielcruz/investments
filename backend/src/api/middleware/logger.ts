import morgan, { StreamOptions } from 'morgan'

import { logger as customLogger } from '../../config/logger'

// Override the stream method by telling Morgan to use our custom logger instead of the console.log
const stream: StreamOptions = {
  // Use the http severity
  write: message => customLogger.http(message.substring(0, message.lastIndexOf('\n')))
}

// Skip all the Morgan http log if the application is running in test mode
const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env === 'test'
}

export const logger = morgan(process.env.MORGAN_FORMAT || 'dev', { stream, skip })
