import { AssetType, TransactionType } from '@prisma/client'

import { makeAsset, makeBroker } from '../../../../tests/factories'
import {
  makeAssetsRepository,
  makeBrokersRepository,
  makeTransactionsRepository
} from '../../../../tests/mocks/repositories'
import { ITransactionAttr } from '../../../database/models'
import { ValidationError } from '../../errors'
import { CreateTransaction } from './create-transaction'

const makeSut = () => {
  const assetsRepoStub = makeAssetsRepository()
  const brokersRepoStub = makeBrokersRepository()
  const txRepoStub = makeTransactionsRepository()
  const sut = new CreateTransaction(assetsRepoStub, brokersRepoStub, txRepoStub)
  const data: ITransactionAttr = {
    assetId: 1,
    brokerId: 1,
    date: new Date(),
    fee: 0,
    quantity: 1,
    type: TransactionType.Buy,
    unitPrice: 10
  }

  return { assetsRepoStub, brokersRepoStub, txRepoStub, sut, data }
}

describe('CreateTransaction', () => {
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

  it('creates a new transaction', async () => {
    const { sut, data, txRepoStub } = makeSut()
    const createSpy = jest.spyOn(txRepoStub, 'create')
    const createdTx = await sut.execute(data)
    expect(createdTx).toBeTruthy()
    expect(createSpy).toHaveBeenCalledWith(data)
  })
})
