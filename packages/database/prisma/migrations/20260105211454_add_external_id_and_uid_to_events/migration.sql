-- DropIndex
DROP INDEX "events_application_id_event_id_key";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "event_id",
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "events_uid_key" ON "events"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "events_application_id_external_id_key" ON "events"("application_id", "external_id");
