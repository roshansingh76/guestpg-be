-- Create States master table
CREATE TABLE "states" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "is_active" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- Add nullable FK column on cities first, so we can backfill before enforcing it
ALTER TABLE "cities" ADD COLUMN "state_id" INTEGER;

-- Backfill: create a State row for every distinct non-empty state string already in cities
INSERT INTO "states" ("name", "is_active", "created_at", "updated_at")
SELECT DISTINCT "state", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "cities"
WHERE "state" IS NOT NULL AND "state" <> '';

-- Link each city to its matching State row
UPDATE "cities"
SET "state_id" = "states"."id"
FROM "states"
WHERE "cities"."state" = "states"."name";

-- Drop the old free-text column now that data has been migrated
ALTER TABLE "cities" DROP COLUMN "state";

-- Enforce the relation
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
