/*
  Warnings:

  - Changed the type of `label` on the `BillItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BillCategory" AS ENUM ('Rent', 'Electricity', 'Water', 'Maintenance', 'Salary', 'Food', 'Internet', 'Other');

-- AlterTable
ALTER TABLE "BillItem" DROP COLUMN "label",
ADD COLUMN     "label" "BillCategory" NOT NULL;
