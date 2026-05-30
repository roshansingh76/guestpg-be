/*
  Warnings:

  - The values [super_admin] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `joining_date` on the `guests` table. All the data in the column will be lost.
  - Added the required column `pg_id` to the `guests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('vacant', 'occupied', 'reserved');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('rent', 'electricity', 'water', 'maintenance', 'salary', 'food', 'internet', 'other');

-- AlterEnum
-- Removed obsolete Role enum migration block. The users table now references the roles table instead of using a Role enum.

-- AlterTable
ALTER TABLE "guests" DROP COLUMN "joining_date",
ADD COLUMN     "bed_id" INTEGER,
ADD COLUMN     "id_proof_url" TEXT,
ADD COLUMN     "move_in_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "move_out_date" TIMESTAMP(3),
ADD COLUMN     "pg_id" INTEGER NOT NULL,
ADD COLUMN     "photo_url" TEXT;

-- CreateTable
CREATE TABLE "pg_beds" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "bed_number" TEXT NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'vacant',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pg_beds_room_id_bed_number_key" ON "pg_beds"("room_id", "bed_number");

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "pg_beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_beds" ADD CONSTRAINT "pg_beds_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "pg_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_beds" ADD CONSTRAINT "pg_beds_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
