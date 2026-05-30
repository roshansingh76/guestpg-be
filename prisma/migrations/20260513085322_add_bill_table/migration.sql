/*
  Warnings:

  - You are about to drop the `rent_bills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bill_items" DROP CONSTRAINT "bill_items_bill_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_bill_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_bills" DROP CONSTRAINT "rent_bills_pg_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_bills" DROP CONSTRAINT "rent_bills_tenant_id_fkey";

-- DropTable
DROP TABLE "rent_bills";

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "bill_month" INTEGER NOT NULL,
    "bill_year" INTEGER NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due_amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bills_tenant_id_bill_month_bill_year_key" ON "bills"("tenant_id", "bill_month", "bill_year");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
