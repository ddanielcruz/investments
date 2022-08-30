-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('Stock', 'Crypto', 'FixedIncome');

-- CreateEnum
CREATE TYPE "AssetProvider" AS ENUM ('CoinMarketcap', 'AlphaVantage');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Buy', 'Sell');

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets_symbols" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "provider" "AssetProvider" NOT NULL,

    CONSTRAINT "assets_symbols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brokers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "supportedTypes" "AssetType"[],

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "broker_id" INTEGER NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_ticker_key" ON "assets"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "brokers_name_key" ON "brokers"("name");

-- AddForeignKey
ALTER TABLE "assets_symbols" ADD CONSTRAINT "assets_symbols_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
