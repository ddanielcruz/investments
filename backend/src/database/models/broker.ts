import { AssetType } from '@prisma/client'

export interface IBroker {
  id: number
  name: string
  supportedTypes: AssetType[]
}
