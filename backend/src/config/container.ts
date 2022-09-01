import { Container } from 'inversify'
import { buildProviderModule } from 'inversify-binding-decorators'

import { PrismaClient } from '@prisma/client'

// TODO: Automatically import dependencies, perhaps using a custom decorator
import '../database/repositories'
import '../core/services/assets/search-assets'
import { client } from '../database/connection'

export const container = new Container()
container.load(buildProviderModule())
container.bind(PrismaClient).toConstantValue(client)
