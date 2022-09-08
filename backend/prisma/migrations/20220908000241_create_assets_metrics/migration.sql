-- CreateTable
CREATE TABLE "assets_metrics" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "market_price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "total_invested" DOUBLE PRECISION NOT NULL,
    "total_equity" DOUBLE PRECISION NOT NULL,
    "return" DOUBLE PRECISION NOT NULL,
    "return_percentage" DOUBLE PRECISION NOT NULL,
    "average_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "assets_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_metrics_asset_id_key" ON "assets_metrics"("asset_id");

-- AddForeignKey
ALTER TABLE "assets_metrics" ADD CONSTRAINT "assets_metrics_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
