import { NotFoundError } from './not-found-error'

const makeSut = () => {
  return new NotFoundError('any-message', 'any-data')
}

describe('NotFoundError', () => {
  it('has status code 404', () => {
    const sut = makeSut()
    expect(sut.statusCode).toBe(404)
  })

  it('sets received message and data ', async () => {
    const sut = makeSut()
    expect(sut.message).toBe('any-message')
    expect(sut.data).toBe('any-data')
  })
})
