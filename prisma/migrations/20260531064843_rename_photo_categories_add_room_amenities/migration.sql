/*
  Warnings:

  - You are about to drop the column `room_type` on the `pg_rooms` table. All the data in the column will be lost.
  - You are about to drop the `pg_photo_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pg_photos" DROP CONSTRAINT "pg_photos_category_id_fkey";

-- AlterTable
ALTER TABLE "pg_rooms" DROP COLUMN "room_type",
ADD COLUMN     "security_per_bed" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "pg_photo_categories";

-- DropTable
DROP TABLE "rooms";

-- CreateTable
CREATE TABLE "photo_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_room_amenities" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "amenity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_room_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_categories_name_key" ON "photo_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pg_room_amenities_room_id_amenity_id_key" ON "pg_room_amenities"("room_id", "amenity_id");

-- AddForeignKey
ALTER TABLE "pg_photos" ADD CONSTRAINT "pg_photos_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "photo_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_room_amenities" ADD CONSTRAINT "pg_room_amenities_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "pg_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_room_amenities" ADD CONSTRAINT "pg_room_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
