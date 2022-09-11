import axios from 'axios'
import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { AssetProvider } from '@prisma/client'

import { HOUR, ICacheRepository } from '../../../cache/cache-repository'
import { logger } from '../../../config/logger'
import { IAsset, IAssetWithSymbols } from '../../../database/models'

export interface IAssetQuote extends IAsset {
  price: number
}

interface ICoinMarketcapResponse {
  data: {
    [symbol: string]: {
      is_active: number
      quote: { USD: { price: number } }
    }[]
  }
}

interface IAlphaVantageResponse {
  'Global Quote': {
    '05. price': string
  }
}

export const CMC_URL = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest'
export const AV_URL = 'https://www.alphavantage.co/query'

@injectable()
export abstract class IQueryAssetsQuotes {
  abstract execute(assets: IAssetWithSymbols[]): Promise<IAssetQuote[]>
}

@provide(IQueryAssetsQuotes)
export class QueryAssetsQuotes implements IQueryAssetsQuotes {
  private readonly coinMarketcapKey: string
  private readonly alphaVantageKey: string

  constructor(private readonly cacheRepository: ICacheRepository) {
    this.coinMarketcapKey = process.env.COINMARKETCAP_KEY!
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_KEY!
  }

  async execute(assets: IAssetWithSymbols[]): Promise<IAssetQuote[]> {
    logger.info(`Querying quotes from assets [${assets.map(asset => asset.ticker).join(', ')}]`)
    const quotes: IAssetQuote[] = []

    // Map assets by provider
    const byProvider = assets.reduce<{ [key: string]: IAssetWithSymbols[] }>((map, asset) => {
      const { provider } = asset.symbols[0]
      map[provider] ??= []
      map[provider].push(asset)

      return map
    }, {})

    // Query latest prices from CoinMarketcap
    if (byProvider[AssetProvider.CoinMarketcap]) {
      const returnedQuotes = await this.queryCoinMarketcap(byProvider[AssetProvider.CoinMarketcap])
      quotes.push(...returnedQuotes)
    }

    // Query latest prices from Alpha Vantage
    if (byProvider[AssetProvider.AlphaVantage]) {
      for (const asset of byProvider[AssetProvider.AlphaVantage]) {
        quotes.push(await this.queryAlphaVantage(asset))
      }
    }

    return quotes
  }

  private async queryCoinMarketcap(assets: IAssetWithSymbols[]): Promise<IAssetQuote[]> {
    // Map assets by symbol and build search query
    const bySymbol = assets.reduce<{ [key: string]: IAssetWithSymbols }>((map, asset) => {
      const { symbol } = asset.symbols[0]
      return { ...map, [symbol]: asset }
    }, {})
    const searchQuery = Object.keys(bySymbol).sort().join(',')

    // Load cache response from repository, if any
    const cacheKey = `CMC-${searchQuery}`
    let data = await this.cacheRepository.read<ICoinMarketcapResponse>(cacheKey)

    if (!data) {
      const response = await axios.get(CMC_URL, {
        headers: { 'X-CMC_PRO_API_KEY': this.coinMarketcapKey },
        params: { symbol: searchQuery }
      })
      data = response.data
      await this.cacheRepository.write(cacheKey, data!, HOUR)
    }

    return Object.keys(bySymbol).map(symbol => {
      return {
        ...bySymbol[symbol],
        price: data!.data[symbol].find(result => result.is_active === 1)?.quote.USD.price || 0
      }
    })
  }

  private async queryAlphaVantage(asset: IAssetWithSymbols): Promise<IAssetQuote> {
    const { symbol } = asset.symbols[0]

    const cacheKey = `AV-${symbol}`
    let data = await this.cacheRepository.read<IAlphaVantageResponse>(cacheKey)

    if (!data) {
      const response = await axios.get(AV_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.alphaVantageKey
        }
      })
      data = response.data
      await this.cacheRepository.write(cacheKey, data!, HOUR)
    }

    return {
      ...asset,
      price: parseFloat(data!['Global Quote']['05. price'])
    }
  }
}
