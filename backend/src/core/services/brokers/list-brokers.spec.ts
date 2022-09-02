import { makeBroker } from '../../../../tests/factories'
import { makeBrokersRepository } from '../../../../tests/mocks/repositories'
import { ListBrokers } from './list-brokers'

const makeSut = () => {
  const brokersRepositoryStubb = makeBrokersRepository()
  const sut = new ListBrokers(brokersRepositoryStubb)

  return { sut, brokersRepositoryStubb }
}

describe('ListBrokers', () => {
  it('lists all brokers using BrokersRepository', async () => {
    const { sut, brokersRepositoryStubb } = makeSut()
    const brokers = [makeBroker(), makeBroker()]
    const findAllSpy = jest.spyOn(brokersRepositoryStubb, 'findAll').mockResolvedValueOnce(brokers)
    const foundBrokers = await sut.execute()
    expect(foundBrokers).toEqual(brokers)
    expect(findAllSpy).toHaveBeenCalledWith()
  })
})
