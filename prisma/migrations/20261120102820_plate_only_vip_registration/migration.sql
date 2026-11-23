/*
  Warnings:

  - A unique constraint covering the columns `[vipCode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "vipCode" TEXT,
ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_vipCode_key" ON "Customer"("vipCode");
