import {
  Asset,
  AssetMetrics,
  AssetProvider,
  AssetSymbol,
  AssetType,
  Broker,
  Transaction,
  TransactionType
} from '@prisma/client'

import { IAsset, IAssetMetricsAttr } from '../src/database/models'

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

export const makeTransaction = (
  assetId: number,
  brokerId: number,
  other?: Partial<Transaction>
): Transaction => {
  const id = makeId()
  return {
    id,
    assetId,
    brokerId,
    unitPrice: 10,
    quantity: 1,
    fee: 0,
    type: TransactionType.Buy,
    date: new Date(),
    ...other
  }
}

export const makeAssetsMetrics = (
  assetId: number,
  other?: Partial<IAssetMetricsAttr>
): AssetMetrics => {
  const id = makeId()
  return {
    id,
    assetId,
    averagePrice: 0,
    marketPrice: 0,
    quantity: 0,
    return: 0,
    returnPercentage: 0,
    totalEquity: 0,
    totalInvested: 0,
    ...other
  }
}
