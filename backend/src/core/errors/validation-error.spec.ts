import Joi from 'joi'

import { ValidationError, FieldError } from './validation-error'

describe('ValidationError', () => {
  const makeSut = () => {
    const errorsStub = [new FieldError('any-field', 'any-message')]
    const sut = new ValidationError(errorsStub)
    return { sut, errorsStub }
  }

  it('has status code 400', () => {
    const { sut } = makeSut()
    expect(sut.statusCode).toBe(400)
  })

  it('sets data as received errors', () => {
    const { sut, errorsStub } = makeSut()
    expect(sut.data).toBe(errorsStub)
  })
})

describe('FieldError', () => {
  describe('generate', () => {
    const validator = Joi.object().keys({ email: Joi.string().email() })

    it('generates errors from a validation result', () => {
      const { error } = validator.validate({ email: 'invalid-email' })
      const errors = FieldError.generate(error)
      expect(errors.length).toBe(1)
      expect(errors[0]).toEqual({ field: 'email', message: expect.any(String) })
    })

    it('sets error label as unknown when it does not have a context', () => {
      const { error } = validator.validate({ email: 'invalid-email' })
      error!.details[0].context = undefined
      const errors = FieldError.generate(error)
      expect(errors[0].field).toBe('unknown')
    })

    it('returns empty list on empty validation result', () => {
      const { error } = validator.validate({ email: 'any@email.com' })
      const errors = FieldError.generate(error)
      expect(errors.length).toBe(0)
    })
  })

  describe('includes', () => {
    const fields = ['field-a', 'field-b']

    it('returns true if errors list has the field', async () => {
      const errors = [
        new FieldError(fields[0], 'any-message'),
        new FieldError('other-field', 'other-message')
      ]
      expect(FieldError.includes(errors, fields[0])).toBe(true)
    })

    it('returns true if errors list has any of the fields', () => {
      const errors = [
        new FieldError(fields[0], 'any-message'),
        new FieldError(fields[1], 'other-message'),
        new FieldError('another-field', 'another-message')
      ]
      expect(FieldError.includes(errors, ...fields)).toBe(true)
    })

    it('returns false if errors list does not have any of the fields', () => {
      const errors = [new FieldError('any-field', 'any-message')]
      expect(FieldError.includes(errors, fields[0])).toBe(false)
    })

    it('returns false if fields list is empty', async () => {
      const errors = [new FieldError('any-field', 'any-message')]
      expect(FieldError.includes(errors)).toBe(false)
    })
  })
})
