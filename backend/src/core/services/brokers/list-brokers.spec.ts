import { makeBroker } from '../../../../tests/factories'
import { makeBrokersRepository } from '../../../../tests/mocks/repositories'
import { ListBrokers } from './list-brokers'

const makeSut = () => {
  const brokersRepositoryStub = makeBrokersRepository()
  const sut = new ListBrokers(brokersRepositoryStub)

  return { sut, brokersRepositoryStub }
}

describe('ListBrokers', () => {
  it('lists all brokers using BrokersRepository', async () => {
    const { sut, brokersRepositoryStub } = makeSut()
    const brokers = [makeBroker(), makeBroker()]
    const findAllSpy = jest.spyOn(brokersRepositoryStub, 'findAll').mockResolvedValueOnce(brokers)
    const foundBrokers = await sut.execute()
    expect(foundBrokers).toEqual(brokers)
    expect(findAllSpy).toHaveBeenCalledWith()
  })
})
