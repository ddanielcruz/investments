import { CustomError } from './custom-error'

class CustomErrorStub extends CustomError {
  statusCode = 418

  constructor() {
    super('any-error', 'any-code', { message: 'any-data' })
  }
}

const makeSut = () => {
  return new CustomErrorStub()
}

describe('CustomError', () => {
  it('sets the error message', () => {
    const sut = makeSut()
    expect(sut.message).toBe('any-error')
  })

  it('serializes the error information', () => {
    const sut = makeSut()
    const data = sut.serialize()
    expect(data).toEqual({
      error: 'any-error',
      code: 'any-code',
      data: {
        message: 'any-data'
      }
    })
  })

  it('returns status code', async () => {
    const sut = makeSut()
    expect(sut.statusCode).toBe(418)
  })
})
