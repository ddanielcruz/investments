import { TransactionType } from '@prisma/client'

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
