-- AlterTable
ALTER TABLE "endpoints" DROP COLUMN "eventTypes";

-- CreateTable
CREATE TABLE "endpoint_routings" (
    "endpoint_id" TEXT NOT NULL,
    "event_type_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,

    CONSTRAINT "endpoint_routings_pkey" PRIMARY KEY ("endpoint_id","event_type_id")
);

-- CreateIndex
CREATE INDEX "endpoint_routings_application_id_event_type_id_endpoint_id_idx" ON "endpoint_routings"("application_id", "event_type_id", "endpoint_id");

-- AddForeignKey
ALTER TABLE "endpoint_routings" ADD CONSTRAINT "endpoint_routings_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endpoint_routings" ADD CONSTRAINT "endpoint_routings_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endpoint_routings" ADD CONSTRAINT "endpoint_routings_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;