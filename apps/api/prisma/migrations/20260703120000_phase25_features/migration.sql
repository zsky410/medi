-- Phase 2.5: cloneCount, budget, settlements, user prefs, attachment metadata

ALTER TABLE "User" ADD COLUMN "defaultCurrency" TEXT NOT NULL DEFAULT 'VND';
ALTER TABLE "User" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'vi';
ALTER TABLE "User" ADD COLUMN "aiGenerationsDate" DATE;
ALTER TABLE "User" ADD COLUMN "aiGenerationsCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Trip" ADD COLUMN "cloneCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Trip" ADD COLUMN "budgetAmount" DOUBLE PRECISION;
ALTER TABLE "Trip" ADD COLUMN "budgetCurrency" TEXT NOT NULL DEFAULT 'VND';

ALTER TABLE "Attachment" ADD COLUMN "uploaderId" TEXT;
ALTER TABLE "Attachment" ADD COLUMN "name" TEXT;

ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploaderId_fkey"
  FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "settled" BOOLEAN NOT NULL DEFAULT true,
    "settledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Settlement_tripId_idx" ON "Settlement"("tripId");

ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_tripId_fkey"
  FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_fromUserId_fkey"
  FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_toUserId_fkey"
  FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
