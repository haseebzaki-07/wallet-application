/*
  Warnings:

  - Added the required column `password` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "OffRampTransaction" (
    "id" SERIAL NOT NULL,
    "status" "OnRampStatus" NOT NULL,
    "token" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "merchantId" INTEGER NOT NULL,

    CONSTRAINT "OffRampTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchantTransfer" (
    "id" SERIAL NOT NULL,
    "transferTime" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "fromMerchantId" INTEGER NOT NULL,
    "toMerchantId" INTEGER NOT NULL,

    CONSTRAINT "merchantTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantBalance" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,

    CONSTRAINT "MerchantBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OffRampTransaction_token_key" ON "OffRampTransaction"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantBalance_merchantId_key" ON "MerchantBalance"("merchantId");

-- AddForeignKey
ALTER TABLE "OffRampTransaction" ADD CONSTRAINT "OffRampTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchantTransfer" ADD CONSTRAINT "merchantTransfer_fromMerchantId_fkey" FOREIGN KEY ("fromMerchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchantTransfer" ADD CONSTRAINT "merchantTransfer_toMerchantId_fkey" FOREIGN KEY ("toMerchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantBalance" ADD CONSTRAINT "MerchantBalance_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
