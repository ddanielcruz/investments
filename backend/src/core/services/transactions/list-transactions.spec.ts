import { makeAsset, makeBroker, makeTransaction } from '../../../../tests/factories'
import { makeTransactionsRepository } from '../../../../tests/mocks/repositories'
import { ITransactionWithEntities } from '../../../database/models'
import { ListTransactions } from './list-transactions'

const makeSut = () => {
  const txRepoStub = makeTransactionsRepository()
  const sut = new ListTransactions(txRepoStub)
  return { sut, txRepoStub }
}

const makeTxWithEntities = (): ITransactionWithEntities => {
  const asset = makeAsset()
  const broker = makeBroker()
  const tx = makeTransaction(asset.id, broker.id)

  return { ...tx, asset, broker }
}

describe('ListTransactions', () => {
  it('lists all transactions', async () => {
    const { sut, txRepoStub } = makeSut()
    const transactions = [makeTxWithEntities()]
    const findAllSpy = jest.spyOn(txRepoStub, 'findAll').mockResolvedValueOnce(transactions)
    const foundTxs = await sut.execute()
    expect(findAllSpy).toHaveBeenCalled()
    expect(foundTxs).toEqual(transactions)
  })
})
