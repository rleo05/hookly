-- AlterTable
ALTER TABLE "event_attempts" ADD COLUMN     "response_header" JSONB,
DROP COLUMN "response_body",
ADD COLUMN     "response_body" JSONB;
