import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'
import Joi from 'joi'

import { TransactionType } from '@prisma/client'

import {
  IAsset,
  IAssetWithSymbols,
  IBroker,
  ITransaction,
  ITransactionAttr
} from '../../../database/models'
import {
  IAssetsRepository,
  IBrokersRepository,
  ITransactionsRepository
} from '../../../database/repositories'
import { FieldError, NotFoundError, ValidationError } from '../../errors'

const validator = Joi.object<ITransactionAttr>().keys({
  assetId: Joi.number().required(),
  brokerId: Joi.number().required(),
  date: Joi.date().iso().required(),
  unitPrice: Joi.number().greater(0).required(),
  quantity: Joi.number().greater(0).required(),
  fee: Joi.number().min(0).required(),
  type: Joi.string()
    .trim()
    .empty('')
    .valid(...Object.values(TransactionType))
})

@injectable()
export abstract class IStoreTransaction {
  abstract execute(data: ITransactionAttr, id?: number): Promise<ITransaction>
}

@provide(IStoreTransaction)
export class StoreTransaction implements IStoreTransaction {
  constructor(
    private readonly assetsRepository: IAssetsRepository,
    private readonly brokersRepository: IBrokersRepository,
    private readonly transactionsRepository: ITransactionsRepository
  ) {}

  async execute(data: ITransactionAttr, id?: number): Promise<ITransaction> {
    const normalizedData = await this.validate(data)
    const transaction = id
      ? await this.transactionsRepository.update(id, normalizedData)
      : await this.transactionsRepository.create(normalizedData)

    if (!transaction) {
      throw new NotFoundError('Transaction not found.')
    }

    return transaction
  }

  private async validate(data: ITransactionAttr): Promise<ITransactionAttr> {
    const { error, value } = validator.validate(data, { abortEarly: false, stripUnknown: true })
    const errors = FieldError.generate(error)
    let asset: IAssetWithSymbols | null = null
    let broker: IBroker | null = null

    if (!FieldError.includes(errors, 'assetId')) {
      asset = await this.assetsRepository.findById(value!.assetId)
      if (!asset) {
        errors.push(new FieldError('assetId', 'Asset not found.'))
      }
    }

    if (!FieldError.includes(errors, 'brokerId')) {
      broker = await this.brokersRepository.findById(value!.brokerId)
      if (!broker) {
        errors.push(new FieldError('brokerId', 'Broker not found.'))
      } else if (asset && !broker.supportedTypes.includes(asset.type)) {
        errors.push(new FieldError('assetId', 'Asset not supported by broker.'))
      }
    }

    if (errors.length) {
      throw new ValidationError(errors)
    }

    return value!
  }
}
