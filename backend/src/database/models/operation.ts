import { OperationType } from '@prisma/client'

import { IAsset } from './asset'
import { IBroker } from './broker'

export interface IOperationAttr {
  assetId: number
  brokerId: number
  unitPrice: number
  quantity: number
  fee: number
  date: Date
  type: OperationType
}

export interface IOperation extends IOperationAttr {
  id: number
}

export interface IOperationWithEntities extends IOperation {
  asset: IAsset
  broker: IBroker
}
