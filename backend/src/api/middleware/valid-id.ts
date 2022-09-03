import { NextFunction, Request, Response } from 'express'

import { BadRequestError } from '../../core/errors'

export const validId =
  (fields: string[] = ['id']) =>
  (request: Request, _response: Response, next: NextFunction) => {
    for (const field of fields) {
      const parsedId = parseInt(request.params[field])
      if (!parsedId || isNaN(parsedId)) {
        throw new BadRequestError('Identifier is not a valid number.', 'INVALID_ID', {
          value: request.params[field]
        })
      }
    }

    next()
  }
