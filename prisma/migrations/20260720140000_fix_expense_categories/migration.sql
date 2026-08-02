-- Create ExpenseCategory master table (schema.prisma has modeled expenses as
-- category_id -> expense_categories since the amenities-era refactor, but this
-- table was never actually created; the expenses table still had the old
-- "category" enum column instead of category_id)
CREATE TABLE "expense_categories" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "expense_categories_name_key" ON "expense_categories"("name");

-- No existing expense rows reference the old enum column, so this is a
-- straight structural swap with no data to migrate.
ALTER TABLE "expenses" DROP COLUMN "category";
ALTER TABLE "expenses" ADD COLUMN "category_id" INTEGER NOT NULL;

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The old enum type is no longer referenced by any column
DROP TYPE IF EXISTS "ExpenseCategory";
