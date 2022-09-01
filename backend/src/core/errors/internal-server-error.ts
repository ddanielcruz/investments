import { CustomError } from './custom-error'

export class InternalServerError extends CustomError {
  readonly statusCode = 500

  constructor(error: Error) {
    super(error.message, 'UNKNOWN_ERROR', { name: error.name, stack: error.stack })
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}
