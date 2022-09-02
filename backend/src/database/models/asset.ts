import { AssetProvider, AssetType } from '@prisma/client'

export interface IAsset {
  id: number
  name: string
  ticker: string
  type: AssetType
}

export interface IAssetSymbol {
  symbol: string
  provider: AssetProvider
}

export interface IAssetWithSymbols {
  symbols: IAssetSymbol[]
}
