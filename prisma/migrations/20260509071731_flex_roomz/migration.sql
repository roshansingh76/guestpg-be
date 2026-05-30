-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PGType" AS ENUM ('Boys', 'Girls', 'CoLiving');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('AC', 'NonAC');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Owner', 'Manager');

-- CreateEnum
CREATE TYPE "PGStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "pg_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "aadhar" TEXT NOT NULL,
    "address" TEXT,
    "emergency" TEXT,
    "emergency_phone" TEXT,
    "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "total_beds" INTEGER NOT NULL,
    "available_beds" INTEGER NOT NULL,
    "rent" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'vacant',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pgs" (
    "id" SERIAL NOT NULL,
    "pg_name" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "owner_phone" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "nearby_mark" TEXT,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "pg_type" "PGType" NOT NULL,
    "number_of_rooms" INTEGER NOT NULL,
    "is_food_available" BOOLEAN NOT NULL DEFAULT false,
    "status" "PGStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "area_id" INTEGER,
    "city_id" INTEGER,

    CONSTRAINT "pgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_rooms" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "room_type" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "total_beds" INTEGER NOT NULL,
    "available_beds" INTEGER NOT NULL,
    "price_per_bed" INTEGER NOT NULL,
    "ac_type" "RoomType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_staff" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_photos" (
    "id" SERIAL NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "photo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_number_key" ON "rooms"("number");

-- CreateIndex
CREATE UNIQUE INDEX "beds_number_key" ON "beds"("number");

-- CreateIndex
CREATE UNIQUE INDEX "pgs_owner_email_key" ON "pgs"("owner_email");

-- CreateIndex
CREATE UNIQUE INDEX "pg_rooms_pg_id_room_number_key" ON "pg_rooms"("pg_id", "room_number");

-- CreateIndex
CREATE UNIQUE INDEX "pg_staff_username_key" ON "pg_staff"("username");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_rooms" ADD CONSTRAINT "pg_rooms_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_staff" ADD CONSTRAINT "pg_staff_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_photos" ADD CONSTRAINT "pg_photos_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
