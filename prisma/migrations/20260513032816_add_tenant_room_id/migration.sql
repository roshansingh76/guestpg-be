-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "roomId" INTEGER;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PGRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
