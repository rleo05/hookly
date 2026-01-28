-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "deleted_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "applications_user_id_external_id_key" 
ON "applications"("user_id", "external_id") 
WHERE "deleted_at" IS NULL;