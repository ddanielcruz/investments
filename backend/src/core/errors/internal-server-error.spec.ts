import { InternalServerError } from './internal-server-error'

const makeSut = () => {
  const errorStub = new Error('any-error')
  const sut = new InternalServerError(errorStub)

  return { sut, errorStub }
}

describe('InternalServerError', () => {
  it('has status code 500 and an error code', () => {
    const { sut } = makeSut()
    expect(sut.statusCode).toBe(500)
    expect(sut.code).toBeTruthy()
  })

  it('has same message as error', () => {
    const { sut, errorStub } = makeSut()
    expect(sut.message).toBe(errorStub.message)
  })

  it('has error name and stack in the data property', () => {
    const { sut, errorStub } = makeSut()
    expect(sut.data).toEqual({ name: errorStub.name, stack: errorStub.stack })
  })
})
