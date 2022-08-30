import { AssetProvider, AssetType, PrismaClient } from '@prisma/client'

import brokers from './data/brokers.json'
import cryptocurrencies from './data/cryptocurrencies.json'
import stocks from './data/stocks.json'

const prisma = new PrismaClient()

async function seedBrokers() {
  console.log(`Seeding ${brokers.length} brokers`)
  for (const { name, supportedTypes } of brokers) {
    await prisma.broker.upsert({
      where: { name },
      update: { supportedTypes: supportedTypes as AssetType[] },
      create: { name, supportedTypes: supportedTypes as AssetType[] }
    })
  }
}

async function seedCryptocurrencies() {
  console.log(`Seeding ${cryptocurrencies.length} cryptocurrencies`)
  for (const { name, symbol } of cryptocurrencies) {
    await prisma.asset.upsert({
      where: { ticker: symbol },
      update: {},
      create: {
        name,
        ticker: symbol,
        type: AssetType.Crypto,
        symbols: {
          create: {
            symbol,
            provider: AssetProvider.CoinMarketcap
          }
        }
      }
    })
  }
}

async function seedStocks() {
  console.log(`Seeding ${stocks.length} stocks`)
  for (const { name, symbol } of stocks) {
    const [ticker] = symbol.split('.')
    await prisma.asset.upsert({
      where: { ticker },
      update: {},
      create: {
        name,
        ticker,
        type: AssetType.Stock,
        symbols: {
          create: {
            symbol,
            provider: AssetProvider.AlphaVantage
          }
        }
      }
    })
  }
}

async function main() {
  await Promise.all([seedBrokers(), seedCryptocurrencies(), seedStocks()])
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
