import { makeTransactionsRepository } from '../../../../tests/mocks/repositories'
import { NotFoundError } from '../../errors'
import { DeleteTransaction } from './delete-transaction'

const makeSut = () => {
  const txRepoStub = makeTransactionsRepository()
  const sut = new DeleteTransaction(txRepoStub)
  return { sut, txRepoStub }
}

describe('DeleteTransaction', () => {
  it('deletes a transaction', async () => {
    const { sut, txRepoStub } = makeSut()
    const deleteSpy = jest.spyOn(txRepoStub, 'delete')
    await sut.execute(1)
    expect(deleteSpy).toHaveBeenCalledWith(1)
  })

  it('throws if transaction is not found', async () => {
    const { sut, txRepoStub } = makeSut()
    jest.spyOn(txRepoStub, 'delete').mockResolvedValueOnce(null)
    const promise = sut.execute(1)
    await expect(promise).rejects.toThrow(NotFoundError)
  })

  it.todo('triggers a job to update the portfolio')
})
