/*
  Warnings:

  - You are about to drop the column `guestId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `guestId` on the `RentBill` table. All the data in the column will be lost.
  - You are about to drop the `Guest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PGBed` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenantId,billMonth,billYear]` on the table `RentBill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `PGPhoto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `RentBill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_bedId_fkey";

-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_pgId_fkey";

-- DropForeignKey
ALTER TABLE "PGBed" DROP CONSTRAINT "PGBed_pgId_fkey";

-- DropForeignKey
ALTER TABLE "PGBed" DROP CONSTRAINT "PGBed_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_guestId_fkey";

-- DropForeignKey
ALTER TABLE "RentBill" DROP CONSTRAINT "RentBill_guestId_fkey";

-- DropIndex
DROP INDEX "RentBill_guestId_billMonth_billYear_key";

-- AlterTable
ALTER TABLE "PGPhoto" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "guestId",
ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RentBill" DROP COLUMN "guestId",
ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Guest";

-- DropTable
DROP TABLE "PGBed";

-- DropEnum
DROP TYPE "BedStatus";

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "pgId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "aadhar" TEXT NOT NULL,
    "address" TEXT,
    "emergency" TEXT,
    "emergencyPhone" TEXT,
    "idProofUrl" TEXT,
    "photoUrl" TEXT,
    "moveInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moveOutDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGPhotoCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PGPhotoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PGPhotoCategory_name_key" ON "PGPhotoCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RentBill_tenantId_billMonth_billYear_key" ON "RentBill"("tenantId", "billMonth", "billYear");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "PG"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGPhoto" ADD CONSTRAINT "PGPhoto_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PGPhotoCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentBill" ADD CONSTRAINT "RentBill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
