-- DropForeignKey
ALTER TABLE "pgs" DROP CONSTRAINT "pgs_area_id_fkey";

-- DropForeignKey
ALTER TABLE "pgs" DROP CONSTRAINT "pgs_city_id_fkey";

-- AlterTable
ALTER TABLE "pgs" ALTER COLUMN "area_id" DROP NOT NULL,
ALTER COLUMN "city_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "pgs" ADD CONSTRAINT "pgs_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pgs" ADD CONSTRAINT "pgs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
