-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('Stock', 'Crypto', 'FixedIncome');

-- CreateEnum
CREATE TYPE "AssetProvider" AS ENUM ('CoinMarketcap', 'AlphaVantage');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Buy', 'Sell');

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetSymbol" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "provider" "AssetProvider" NOT NULL,

    CONSTRAINT "AssetSymbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "supported_types" "AssetType"[],

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "broker_id" INTEGER NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetSymbol" ADD CONSTRAINT "AssetSymbol_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
