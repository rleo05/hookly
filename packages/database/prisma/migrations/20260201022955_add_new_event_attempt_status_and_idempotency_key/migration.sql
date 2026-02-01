/*
  Warnings:

  - A unique constraint covering the columns `[idempotency_key]` on the table `event_attempts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotency_key` to the `event_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AttemptStatus" ADD VALUE 'ENQUEUED';

-- DropIndex
DROP INDEX "event_attempts_endpoint_id_idx";

-- DropIndex
DROP INDEX "event_attempts_event_id_idx";

-- AlterTable
ALTER TABLE "event_attempts" ADD COLUMN     "idempotency_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "event_attempts_idempotency_key_key" ON "event_attempts"("idempotency_key");

-- CreateIndex
CREATE INDEX "event_attempts_event_id_endpoint_id_idx" ON "event_attempts"("event_id", "endpoint_id");
