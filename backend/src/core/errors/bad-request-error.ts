import { CustomError } from './custom-error'

export class BadRequestError extends CustomError {
  readonly statusCode = 400

  constructor(message: string, code: string, data?: any) {
    super(message, code, data)
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}
