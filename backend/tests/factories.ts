import { Asset, AssetProvider, AssetSymbol, AssetType, Broker } from '@prisma/client'

const makeId = () => Math.floor(Math.random() * 1e9)

export const makeBroker = (other?: Partial<Broker>): Broker => {
  const id = makeId()
  return {
    id,
    name: `broker-${id}`,
    supportedTypes: [AssetType.Stock],
    ...other
  }
}

export const makeAsset = (other?: Partial<Asset>): Asset => {
  const id = makeId()
  return {
    id,
    name: `name-${id}`,
    ticker: `ticker-${id}`,
    type: AssetType.Stock,
    ...other
  }
}

export const makeAssetSymbol = (other?: Partial<AssetSymbol>): AssetSymbol => {
  const id = makeId()
  return {
    id,
    assetId: id,
    provider: AssetProvider.AlphaVantage,
    symbol: `symbol-${id}`,
    ...other
  }
}
