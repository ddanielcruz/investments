import { Queue } from 'bullmq'
import { readdir } from 'fs/promises'
import { Container } from 'inversify'
import { buildProviderModule } from 'inversify-binding-decorators'
import Redis from 'ioredis'
import { resolve } from 'path'

import { PrismaClient } from '@prisma/client'

import { client } from '../database/connection'
import * as queue from '../queue/connection'
import * as redis from './redis'

export const container = new Container()

async function importModules() {
  // Import data sources' repositories
  await import('../database/repositories')
  await import('../cache/cache-repository')

  // Import all services from subfolders
  const basePath = resolve(__dirname, '..', 'core', 'services')
  const subfolders = await readdir(basePath)
  const filePaths: string[] = []

  for (const folder of subfolders) {
    const folderPath = resolve(basePath, folder)
    const files = await readdir(folderPath)
    files
      .filter(file => !file.endsWith('.spec.ts'))
      .forEach(file => filePaths.push(resolve(folderPath, file)))
  }

  await Promise.all(filePaths.map(filepath => import(filepath)))
}

async function setup() {
  await importModules()
  container.load(buildProviderModule())
  container.bind(PrismaClient).toConstantValue(client)
  container
    .bind(Redis)
    .toDynamicValue(() => redis.connect())
    .inSingletonScope()
  container
    .bind(Queue)
    .toDynamicValue(() => queue.connect())
    .inSingletonScope()
}

setup()
