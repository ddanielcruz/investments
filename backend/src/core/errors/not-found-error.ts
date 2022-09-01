import { CustomError } from './custom-error'

export class NotFoundError extends CustomError {
  readonly statusCode = 404

  constructor(message: string, data?: any) {
    super(message, 'NOT_FOUND', data)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}
