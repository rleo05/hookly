-- AlterTable
ALTER TABLE "endpoints" ADD COLUMN     "headers" JSONB,
ADD COLUMN     "method" TEXT NOT NULL;
