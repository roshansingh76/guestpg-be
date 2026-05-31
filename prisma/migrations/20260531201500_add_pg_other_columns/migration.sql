-- Manual migration: add area_other and city_other to pgs
ALTER TABLE "pgs" ADD COLUMN IF NOT EXISTS "area_other" TEXT;
ALTER TABLE "pgs" ADD COLUMN IF NOT EXISTS "city_other" TEXT;
