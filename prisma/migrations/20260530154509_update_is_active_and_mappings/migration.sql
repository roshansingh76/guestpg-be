/*
  Warnings:

  - You are about to drop the column `area` on the `pgs` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `pgs` table. All the data in the column will be lost.
  - You are about to drop the column `nearby_mark` on the `pgs` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `pg_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_pgs` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `area_id` on table `pgs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city_id` on table `pgs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bills" DROP CONSTRAINT "bills_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_pg_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_room_id_fkey";

-- DropForeignKey
ALTER TABLE "user_pgs" DROP CONSTRAINT "user_pgs_pg_id_fkey";

-- DropForeignKey
ALTER TABLE "user_pgs" DROP CONSTRAINT "user_pgs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_pg_id_fkey";

-- AlterTable
ALTER TABLE "pgs" DROP COLUMN "area",
DROP COLUMN "city",
DROP COLUMN "nearby_mark",
ADD COLUMN     "is_active" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "area_id" SET NOT NULL,
ALTER COLUMN "city_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "status",
ADD COLUMN     "is_active" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "pg_id",
ADD COLUMN     "is_active" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pGId" INTEGER;

-- DropTable
DROP TABLE "tenants";

-- DropTable
DROP TABLE "user_pgs";

-- CreateTable
CREATE TABLE "pg_tenants" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "room_id" INTEGER,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "aadhar" TEXT NOT NULL,
    "address" TEXT,
    "emergency" TEXT,
    "emergency_phone" TEXT,
    "id_proof_url" TEXT,
    "photo_url" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "move_in_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "move_out_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pg_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_city_id_key" ON "areas"("name", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "pg_users_user_id_pg_id_key" ON "pg_users"("user_id", "pg_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pGId_fkey" FOREIGN KEY ("pGId") REFERENCES "pgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenants" ADD CONSTRAINT "pg_tenants_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_tenants" ADD CONSTRAINT "pg_tenants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "pg_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pgs" ADD CONSTRAINT "pgs_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pgs" ADD CONSTRAINT "pgs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_users" ADD CONSTRAINT "pg_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_users" ADD CONSTRAINT "pg_users_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pg_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "pg_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
