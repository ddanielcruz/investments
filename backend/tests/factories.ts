import {
  Asset,
  AssetMetrics,
  AssetProvider,
  AssetSymbol,
  AssetType,
  Broker,
  Operation,
  OperationType
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

export const makeOperation = (
  assetId: number,
  brokerId: number,
  other?: Partial<Operation>
): Operation => {
  const id = makeId()
  return {
    id,
    assetId,
    brokerId,
    unitPrice: 10,
    quantity: 1,
    fee: 0,
    type: OperationType.Buy,
    date: new Date(),
    ...other
  }
}

export const makeAssetMetrics = (
  assetId: number,
  other?: Partial<IAssetMetricsAttr>
): AssetMetrics => {
  const id = makeId()
  return {
    id,
    assetId,
    averagePrice: 0,
    marketPrice: 0,
    quantity: 10,
    return: 0,
    returnPercentage: 0,
    totalEquity: 0,
    totalInvested: 0,
    ...other
  }
}
