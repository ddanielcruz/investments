import axios from 'axios'

import { AssetProvider } from '@prisma/client'

import { makeAsset, makeAssetSymbol } from '../../../../tests/factories'
import AV_RESPONSE from '../../../../tests/fixtures/alphavantage-response.json'
import CMC_RESPONSE from '../../../../tests/fixtures/coinmarketcap-response.json'
import { makeCacheRepository } from '../../../../tests/mocks/repositories'
import { IAssetWithSymbols } from '../../../database/models'
import { AV_URL, CMC_URL, QueryAssetsQuotes } from './query-assets-quotes'

const makeSut = () => {
  const cacheRepositoryStub = makeCacheRepository()
  const sut = new QueryAssetsQuotes(cacheRepositoryStub)
  axios.get = jest.fn().mockImplementation(async url => {
    return url.includes('alphavantage') ? { data: AV_RESPONSE } : { data: CMC_RESPONSE }
  })

  return { sut, cacheRepositoryStub }
}

const ASSETS: IAssetWithSymbols[] = [
  {
    ...makeAsset(),
    symbols: [makeAssetSymbol({ provider: AssetProvider.CoinMarketcap, symbol: 'BTC' })]
  },
  {
    ...makeAsset(),
    symbols: [makeAssetSymbol({ provider: AssetProvider.CoinMarketcap, symbol: 'ETH' })]
  },
  {
    ...makeAsset(),
    symbols: [makeAssetSymbol({ provider: AssetProvider.AlphaVantage, symbol: 'VWRA.LON' })]
  }
]

describe('QueryAssetsQuotes', () => {
  beforeAll(() => {
    Object.assign(process.env, { COINMARKETCAP_KEY: 'CMC-KEY', ALPHA_VANTAGE_KEY: 'AV-KEY' })
  })

  beforeEach(() => {})

  it('queries cryptocurrencies on CoinMarketcap and caches result', async () => {
    const { sut, cacheRepositoryStub } = makeSut()
    const writeSpy = jest.spyOn(cacheRepositoryStub, 'write')
    const quotes = await sut.execute(ASSETS)
    expect(quotes[0].price).toEqual(CMC_RESPONSE.data.BTC[0].quote.USD.price)
    expect(quotes[1].price).toEqual(CMC_RESPONSE.data.ETH[0].quote.USD.price)
    expect(axios.get).toHaveBeenCalledWith(CMC_URL, {
      headers: { 'X-CMC_PRO_API_KEY': 'CMC-KEY' },
      params: { symbol: 'BTC,ETH' }
    })
    expect(writeSpy).toHaveBeenCalledWith(expect.any(String), CMC_RESPONSE, expect.any(Number))
  })

  it('queries stocks on AlphaVantage and caches response', async () => {
    const { sut, cacheRepositoryStub } = makeSut()
    const writeSpy = jest.spyOn(cacheRepositoryStub, 'write')
    const quotes = await sut.execute(ASSETS)
    expect(quotes[2].price).toEqual(parseFloat(AV_RESPONSE['Global Quote']['05. price']))
    expect(axios.get).toHaveBeenCalledWith(AV_URL, {
      params: {
        function: expect.any(String),
        symbol: 'VWRA.LON',
        apikey: 'AV-KEY'
      }
    })
    expect(writeSpy).toHaveBeenCalledWith(expect.any(String), AV_RESPONSE, expect.any(Number))
  })

  it('uses CoinMarketcap cached response when found', async () => {
    const { sut, cacheRepositoryStub } = makeSut()
    jest.spyOn(cacheRepositoryStub, 'read').mockImplementation(async key => {
      const clonedResponse = JSON.parse(JSON.stringify(CMC_RESPONSE))
      clonedResponse.data.BTC[0].quote.USD.price = 10
      return key.startsWith('AV-') ? null : clonedResponse
    })
    const quotes = await sut.execute(ASSETS)
    expect(quotes[0].price).toEqual(10)
  })

  it('uses AlphaVantage cached response when found', async () => {
    const { sut, cacheRepositoryStub } = makeSut()
    jest.spyOn(cacheRepositoryStub, 'read').mockImplementation(async key => {
      return key.startsWith('AV-')
        ? { 'Global Quote': { ...AV_RESPONSE['Global Quote'], '05. price': '5' } }
        : null
    })
    const quotes = await sut.execute(ASSETS)
    expect(quotes[2].price).toEqual(5)
    expect(axios.get).not.toHaveBeenCalledWith(AV_URL, expect.any(Object))
  })

  it('sets price as zero if crypto is no longer active on CoinMarketcap', async () => {
    const { sut } = makeSut()
    axios.get = jest.fn().mockImplementation(async url => {
      const clonedResponse = JSON.parse(JSON.stringify(CMC_RESPONSE))
      clonedResponse.data.BTC[0].is_active = 0
      return url.includes('alphavantage') ? { data: AV_RESPONSE } : { data: clonedResponse }
    })
    const quotes = await sut.execute(ASSETS)
    expect(quotes[0].price).toEqual(0)
  })
})
