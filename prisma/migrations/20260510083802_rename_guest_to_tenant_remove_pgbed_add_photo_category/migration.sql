/*
  Warnings:

  - You are about to drop the column `guest_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `guest_id` on the `rent_bills` table. All the data in the column will be lost.
  - You are about to drop the `guests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pg_beds` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenant_id,bill_month,bill_year]` on the table `rent_bills` will be added. If these are existing duplicate values, this will fail.
  - Added the required column `category_id` to the `pg_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `rent_bills` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "guests" DROP CONSTRAINT "guests_bed_id_fkey";

-- DropForeignKey
ALTER TABLE "guests" DROP CONSTRAINT "guests_pg_id_fkey";

-- DropForeignKey
ALTER TABLE "pg_beds" DROP CONSTRAINT "pg_beds_pg_id_fkey";

-- DropForeignKey
ALTER TABLE "pg_beds" DROP CONSTRAINT "pg_beds_room_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_guest_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_bills" DROP CONSTRAINT "rent_bills_guest_id_fkey";

-- DropIndex
DROP INDEX "rent_bills_guest_id_bill_month_bill_year_key";

-- AlterTable
ALTER TABLE "pg_photos" ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "guest_id",
ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "rent_bills" DROP COLUMN "guest_id",
ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "guests";

-- DropTable
DROP TABLE "pg_beds";

-- DropEnum
DROP TYPE "BedStatus";

-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "aadhar" TEXT NOT NULL,
    "address" TEXT,
    "emergency" TEXT,
    "emergency_phone" TEXT,
    "id_proof_url" TEXT,
    "photo_url" TEXT,
    "move_in_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "move_out_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_photo_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_photo_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pg_photo_categories_name_key" ON "pg_photo_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rent_bills_tenant_id_bill_month_bill_year_key" ON "rent_bills"("tenant_id", "bill_month", "bill_year");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_photos" ADD CONSTRAINT "pg_photos_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "pg_photo_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_bills" ADD CONSTRAINT "rent_bills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
