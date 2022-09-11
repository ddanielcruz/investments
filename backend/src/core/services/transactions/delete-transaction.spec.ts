import {
  makeQueueRepository,
  makeTransactionsRepository
} from '../../../../tests/mocks/repositories'
import { PROCESS_PORTFOLIO_METRICS } from '../../../queue/jobs/process-portfolio-metrics'
import { NotFoundError } from '../../errors'
import { DeleteTransaction } from './delete-transaction'

const makeSut = () => {
  const txRepoStub = makeTransactionsRepository()
  const queueRepoStub = makeQueueRepository()
  const sut = new DeleteTransaction(txRepoStub, queueRepoStub)
  return { sut, txRepoStub, queueRepoStub }
}

describe('DeleteTransaction', () => {
  it('deletes a transaction', async () => {
    const { sut, txRepoStub } = makeSut()
    const deleteSpy = jest.spyOn(txRepoStub, 'delete')
    await sut.execute(1)
    expect(deleteSpy).toHaveBeenCalledWith(1)
  })

  it('throws if transaction is not found', async () => {
    const { sut, txRepoStub, queueRepoStub } = makeSut()
    const addSpy = jest.spyOn(queueRepoStub, 'add')
    jest.spyOn(txRepoStub, 'delete').mockResolvedValueOnce(null)
    const promise = sut.execute(1)
    await expect(promise).rejects.toThrow(NotFoundError)
    expect(addSpy).not.toHaveBeenCalled()
  })

  it('triggers a job to update the portfolio', async () => {
    const { sut, queueRepoStub } = makeSut()
    const addSpy = jest.spyOn(queueRepoStub, 'add')
    await sut.execute(1)
    expect(addSpy).toHaveBeenCalledWith(PROCESS_PORTFOLIO_METRICS)
  })
})
