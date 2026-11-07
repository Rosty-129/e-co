/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `ProductPhoto` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductPhoto" DROP CONSTRAINT "ProductPhoto_productid_fkey";

-- AlterTable
ALTER TABLE "ProductPhoto" ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductPhoto_publicId_key" ON "ProductPhoto"("publicId");

-- AddForeignKey
ALTER TABLE "ProductPhoto" ADD CONSTRAINT "ProductPhoto_productid_fkey" FOREIGN KEY ("productid") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
