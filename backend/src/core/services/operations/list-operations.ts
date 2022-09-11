import { injectable } from 'inversify'
import { provide } from 'inversify-binding-decorators'

import { IOperationWithEntities } from '../../../database/models'
import { IOperationsRepository } from '../../../database/repositories'

@injectable()
export abstract class IListOperations {
  abstract execute(): Promise<IOperationWithEntities[]>
}

@provide(IListOperations)
export class ListOperations implements IListOperations {
  constructor(private readonly operationsRepository: IOperationsRepository) {}

  execute(): Promise<IOperationWithEntities[]> {
    return this.operationsRepository.findAll()
  }
}
