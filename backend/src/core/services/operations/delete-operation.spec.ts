import { makeQueueRepository, makeOperationsRepository } from '../../../../tests/mocks/repositories'
import { PROCESS_PORTFOLIO_METRICS } from '../../../queue/jobs/process-portfolio-metrics'
import { NotFoundError } from '../../errors'
import { DeleteOperation } from './delete-operation'

const makeSut = () => {
  const opRepoStub = makeOperationsRepository()
  const queueRepoStub = makeQueueRepository()
  const sut = new DeleteOperation(opRepoStub, queueRepoStub)
  return { sut, opRepoStub, queueRepoStub }
}

describe('DeleteOperation', () => {
  it('deletes an operation', async () => {
    const { sut, opRepoStub } = makeSut()
    const deleteSpy = jest.spyOn(opRepoStub, 'delete')
    await sut.execute(1)
    expect(deleteSpy).toHaveBeenCalledWith(1)
  })

  it('throws if operation is not found', async () => {
    const { sut, opRepoStub, queueRepoStub } = makeSut()
    const addSpy = jest.spyOn(queueRepoStub, 'add')
    jest.spyOn(opRepoStub, 'delete').mockResolvedValueOnce(null)
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
