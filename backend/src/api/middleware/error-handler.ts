import { Request, Response, NextFunction } from 'express'

import { logger } from '../../config/logger'
import { CustomError, InternalServerError } from '../../core/errors'

export const errorHandler = async (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof CustomError) {
    return response.status(error.statusCode).json(error.serialize())
  }

  logger.error(error.stack ?? error)
  return response.status(500).json(new InternalServerError(error).serialize())
}
