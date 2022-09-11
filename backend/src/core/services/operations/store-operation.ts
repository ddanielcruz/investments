import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'
import Joi from 'joi'

import { OperationType } from '@prisma/client'

import { IAssetWithSymbols, IBroker, IOperation, IOperationAttr } from '../../../database/models'
import {
  IAssetsRepository,
  IBrokersRepository,
  IOperationsRepository
} from '../../../database/repositories'
import { PROCESS_PORTFOLIO_METRICS } from '../../../queue/jobs/process-portfolio-metrics'
import { IQueueRepository } from '../../../queue/queue-repository'
import { FieldError, NotFoundError, ValidationError } from '../../errors'

const validator = Joi.object<IOperationAttr>().keys({
  assetId: Joi.number().required(),
  brokerId: Joi.number().required(),
  date: Joi.date().iso().required(),
  unitPrice: Joi.number().greater(0).required(),
  quantity: Joi.number().greater(0).required(),
  fee: Joi.number().min(0).required(),
  type: Joi.string()
    .trim()
    .empty('')
    .valid(...Object.values(OperationType))
})

@injectable()
export abstract class IStoreOperation {
  abstract execute(data: IOperationAttr, id?: number): Promise<IOperation>
}

@provide(IStoreOperation)
export class StoreOperation implements IStoreOperation {
  constructor(
    private readonly assetsRepository: IAssetsRepository,
    private readonly brokersRepository: IBrokersRepository,
    private readonly operationsRepository: IOperationsRepository,
    private readonly queueRepository: IQueueRepository
  ) {}

  async execute(data: IOperationAttr, id?: number): Promise<IOperation> {
    // TODO: Validate asset quantity on sell operations (avoid negative quantities), separate into separate services
    const normalizedData = await this.validate(data)
    const operation = id
      ? await this.operationsRepository.update(id, normalizedData)
      : await this.operationsRepository.create(normalizedData)

    if (!operation) {
      throw new NotFoundError('Operation not found.')
    }

    await this.queueRepository.add(PROCESS_PORTFOLIO_METRICS)

    return operation
  }

  private async validate(data: IOperationAttr): Promise<IOperationAttr> {
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
