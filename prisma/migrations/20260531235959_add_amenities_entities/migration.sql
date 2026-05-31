-- Create Amenity master table
CREATE TABLE "amenities" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- Create PG amenity join table
CREATE TABLE "pg_amenities" (
  "id" SERIAL NOT NULL,
  "pg_id" INTEGER NOT NULL,
  "amenity_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pg_amenities_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");
CREATE UNIQUE INDEX "pg_amenities_pg_id_amenity_id_key" ON "pg_amenities"("pg_id", "amenity_id");

-- Foreign keys
ALTER TABLE "pg_amenities" ADD CONSTRAINT "pg_amenities_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pg_amenities" ADD CONSTRAINT "pg_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
