import { makeAsset } from '../../../../tests/factories'
import { makeAssetsRepository } from '../../../../tests/mocks/repositories'
import { SearchAssets } from './search-assets'

const makeSut = () => {
  const assetsRepositoryStub = makeAssetsRepository()
  const sut = new SearchAssets(assetsRepositoryStub)
  return { sut, assetsRepositoryStub }
}

describe('SearchAssets', () => {
  it('searches assets using AssetsRepository', async () => {
    const { sut, assetsRepositoryStub } = makeSut()
    const assets = [makeAsset()]
    const findByManySpy = jest.spyOn(assetsRepositoryStub, 'findMany').mockResolvedValueOnce(assets)
    const foundAssets = await sut.execute('any-query')
    expect(foundAssets).toEqual(assets)
    expect(findByManySpy).toHaveBeenCalledWith('any-query')
  })
})
