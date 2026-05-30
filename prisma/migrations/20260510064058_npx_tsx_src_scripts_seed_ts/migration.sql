/*
  Warnings:

  - You are about to drop the `pg_staff` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('draft', 'pending', 'partial', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque', 'other');

-- DropForeignKey
ALTER TABLE "pg_staff" DROP CONSTRAINT "pg_staff_pg_id_fkey";

-- DropTable
DROP TABLE "pg_staff";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "rent_bills" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "bill_month" INTEGER NOT NULL,
    "bill_year" INTEGER NOT NULL,
    "rent_amount" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due_amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_items" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "reference_no" TEXT,
    "note" TEXT,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rent_bills_guest_id_bill_month_bill_year_key" ON "rent_bills"("guest_id", "bill_month", "bill_year");

-- AddForeignKey
ALTER TABLE "rent_bills" ADD CONSTRAINT "rent_bills_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_bills" ADD CONSTRAINT "rent_bills_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "rent_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "rent_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
