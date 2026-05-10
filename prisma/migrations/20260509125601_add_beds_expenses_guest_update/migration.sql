/*
  Warnings:

  - The values [super_admin] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `joiningDate` on the `Guest` table. All the data in the column will be lost.
  - Added the required column `pgId` to the `Guest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('vacant', 'occupied', 'reserved');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('rent', 'electricity', 'water', 'maintenance', 'salary', 'food', 'internet', 'other');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'pg_owner', 'pg_staff');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'pg_owner';
COMMIT;

-- AlterTable
ALTER TABLE "Guest" DROP COLUMN "joiningDate",
ADD COLUMN     "bedId" INTEGER,
ADD COLUMN     "idProofUrl" TEXT,
ADD COLUMN     "moveInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "moveOutDate" TIMESTAMP(3),
ADD COLUMN     "pgId" INTEGER NOT NULL,
ADD COLUMN     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pgId" INTEGER,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "PGBed" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "pgId" INTEGER NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'vacant',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PGBed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "pgId" INTEGER NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PGBed_roomId_bedNumber_key" ON "PGBed"("roomId", "bedNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "PG"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "PG"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "PGBed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGBed" ADD CONSTRAINT "PGBed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PGRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGBed" ADD CONSTRAINT "PGBed_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "PG"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_pgId_fkey" FOREIGN KEY ("pgId") REFERENCES "PG"("id") ON DELETE CASCADE ON UPDATE CASCADE;
