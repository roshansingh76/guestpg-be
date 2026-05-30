-- CreateTable
CREATE TABLE "user_pgs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pg_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pgs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_pgs_user_id_pg_id_key" ON "user_pgs"("user_id", "pg_id");

-- AddForeignKey
ALTER TABLE "user_pgs" ADD CONSTRAINT "user_pgs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pgs" ADD CONSTRAINT "user_pgs_pg_id_fkey" FOREIGN KEY ("pg_id") REFERENCES "pgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
