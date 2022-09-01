import 'reflect-metadata'

import { container } from './config/container'
import { IBrokersRepository } from './database/repositories'

const repository = container.get(IBrokersRepository)
repository.findAll().then(console.log)
