import { AssetType, Broker } from '@prisma/client'

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
