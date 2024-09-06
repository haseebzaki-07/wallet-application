-- CreateTable
CREATE TABLE "UsertoMerchantTransfer" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "product" TEXT NOT NULL,

    CONSTRAINT "UsertoMerchantTransfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsertoMerchantTransfer" ADD CONSTRAINT "UsertoMerchantTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsertoMerchantTransfer" ADD CONSTRAINT "UsertoMerchantTransfer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
