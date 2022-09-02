import { ValidationError as JoiValidationError } from 'joi'

import { CustomError } from './custom-error'

export class FieldError {
  constructor(readonly field: string, readonly message: string) {}

  static generate(error: JoiValidationError | undefined) {
    const errors = error?.details ?? []
    return errors
      .filter(error => error.type !== 'object.unknown')
      .map(error => new FieldError(error.context?.label || 'unknown', error.message))
  }

  static includes(errors: FieldError[], ...fields: string[]) {
    return errors.some(error => fields.includes(error.field))
  }
}

export class ValidationError extends CustomError<FieldError[]> {
  readonly statusCode = 400

  constructor(errors: FieldError[]) {
    super('One or more validations failed.', 'VALIDATION_FAILED', errors)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
