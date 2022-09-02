import { TransactionType } from '@prisma/client'

import { IAsset } from './asset'
import { IBroker } from './broker'

export interface ITransactionAttr {
  assetId: number
  brokerId: number
  unitPrice: number
  quantity: number
  fee: number
  date: Date
  type: TransactionType
}

export interface ITransaction extends ITransactionAttr {
  id: number
}

export interface ITransactionWithEntities extends ITransaction {
  asset: IAsset
  broker: IBroker
}
