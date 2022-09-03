import { BadRequestError } from './bad-request-error'

const makeSut = () => {
  return new BadRequestError('any-message', 'any-code', 'any-data')
}

describe('BadRequestError', () => {
  it('has status code 400', () => {
    const sut = makeSut()
    expect(sut.statusCode).toBe(400)
  })

  it('sets received message, code and data ', async () => {
    const sut = makeSut()
    expect(sut.message).toBe('any-message')
    expect(sut.code).toBe('any-code')
    expect(sut.data).toBe('any-data')
  })
})
