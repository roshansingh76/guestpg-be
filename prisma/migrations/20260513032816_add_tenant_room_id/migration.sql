-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "room_id" INTEGER;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "pg_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
