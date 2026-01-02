-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "deleted_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "applications_user_id_uid_key" 
ON "applications"("user_id", "uid") 
WHERE "deleted_at" IS NULL;