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

export interface IAssetWithSymbols extends IAsset {
  symbols: IAssetSymbol[]
}

export interface IAssetMetricsAttr {
  assetId: number
  marketPrice: number
  quantity: number
  totalInvested: number
  totalEquity: number
  return: number
  returnPercentage: number
  averagePrice: number
}

export interface IAssetMetrics extends IAssetMetricsAttr {
  id: number
}

export interface IAssetMetricsWithAsset extends IAssetMetrics {
  asset: IAsset
}
