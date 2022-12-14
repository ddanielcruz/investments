import { OperationType } from '@prisma/client'

import { makeBroker } from '../../../../tests/factories'
import {
  makeAssetsRepository,
  makeBrokersRepository,
  makeQueueRepository,
  makeOperationsRepository
} from '../../../../tests/mocks/repositories'
import { IOperationAttr } from '../../../database/models'
import { PROCESS_PORTFOLIO_METRICS } from '../../../queue/jobs/process-portfolio-metrics'
import { NotFoundError, ValidationError } from '../../errors'
import { StoreOperation } from './store-operation'

const makeSut = () => {
  const assetsRepoStub = makeAssetsRepository()
  const brokersRepoStub = makeBrokersRepository()
  const txRepoStub = makeOperationsRepository()
  const queueRepoStub = makeQueueRepository()
  const sut = new StoreOperation(assetsRepoStub, brokersRepoStub, txRepoStub, queueRepoStub)
  const data: IOperationAttr = {
    assetId: 1,
    brokerId: 1,
    date: new Date(),
    fee: 0,
    quantity: 1,
    type: OperationType.Buy,
    unitPrice: 10
  }

  return { assetsRepoStub, brokersRepoStub, txRepoStub, sut, data, queueRepoStub }
}

describe('StoreOperation', () => {
  it.each([
    { assetId: undefined },
    { brokerId: undefined },
    { date: undefined },
    { date: 'invalid-date' },
    { unitPrice: 0 },
    { unitPrice: undefined },
    { quantity: 0 },
    { quantity: undefined },
    { fee: undefined },
    { type: 'invalid-type' }
  ])('throws if data is invalid: %o', async other => {
    const { sut, data } = makeSut()
    const promise = sut.execute({ ...data, ...other } as any)
    await expect(promise).rejects.toThrow(ValidationError)
  })

  it('throws if assets is not found', async () => {
    const { sut, data, assetsRepoStub } = makeSut()
    jest.spyOn(assetsRepoStub, 'findById').mockResolvedValueOnce(null)
    const promise = sut.execute(data)
    await expect(promise).rejects.toThrow(ValidationError)
  })

  it('throws if broker is not found', async () => {
    const { sut, data, brokersRepoStub } = makeSut()
    jest.spyOn(brokersRepoStub, 'findById').mockResolvedValueOnce(null)
    const promise = sut.execute(data)
    await expect(promise).rejects.toThrow(ValidationError)
  })

  it('throws if asset is not supported by broker', async () => {
    const { sut, data, brokersRepoStub } = makeSut()
    jest
      .spyOn(brokersRepoStub, 'findById')
      .mockResolvedValueOnce(makeBroker({ supportedTypes: [] }))
    const promise = sut.execute(data)
    await expect(promise).rejects.toThrow(ValidationError)
  })

  it('creates a new operation', async () => {
    const { sut, data, txRepoStub } = makeSut()
    const createSpy = jest.spyOn(txRepoStub, 'create')
    const createdTx = await sut.execute(data)
    expect(createdTx).toBeTruthy()
    expect(createSpy).toHaveBeenCalledWith(data)
  })

  it('updates operation if informed an ID', async () => {
    const { sut, data, txRepoStub } = makeSut()
    const updateSpy = jest.spyOn(txRepoStub, 'update')
    await sut.execute(data, 1)
    expect(updateSpy).toHaveBeenCalledWith(1, data)
  })

  it('throws if operation is not found to update', async () => {
    const { sut, data, txRepoStub } = makeSut()
    jest.spyOn(txRepoStub, 'update').mockResolvedValueOnce(null)
    const promise = sut.execute(data, 1)
    await expect(promise).rejects.toThrow(NotFoundError)
  })

  it('triggers a job to update the portfolio', async () => {
    const { sut, queueRepoStub, data } = makeSut()
    const addSpy = jest.spyOn(queueRepoStub, 'add')
    await sut.execute(data)
    expect(addSpy).toHaveBeenCalledWith(PROCESS_PORTFOLIO_METRICS)
  })
})
