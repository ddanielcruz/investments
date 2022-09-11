import { makeAsset, makeBroker, makeOperation } from '../../../../tests/factories'
import { makeOperationsRepository } from '../../../../tests/mocks/repositories'
import { IOperationWithEntities } from '../../../database/models'
import { ListOperations } from './list-operations'

const makeSut = () => {
  const opRepoStub = makeOperationsRepository()
  const sut = new ListOperations(opRepoStub)
  return { sut, opRepoStub }
}

const makeOpWithEntities = (): IOperationWithEntities => {
  const asset = makeAsset()
  const broker = makeBroker()
  const op = makeOperation(asset.id, broker.id)

  return { ...op, asset, broker }
}

describe('ListOperations', () => {
  it('lists all operations', async () => {
    const { sut, opRepoStub } = makeSut()
    const operations = [makeOpWithEntities()]
    const findAllSpy = jest.spyOn(opRepoStub, 'findAll').mockResolvedValueOnce(operations)
    const foundOps = await sut.execute()
    expect(findAllSpy).toHaveBeenCalled()
    expect(foundOps).toEqual(operations)
  })
})
