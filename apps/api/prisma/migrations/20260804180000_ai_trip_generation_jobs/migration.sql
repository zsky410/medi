-- AlterTable
ALTER TABLE "PlaceCatalog" ADD COLUMN "placeType" TEXT,
ADD COLUMN "sourceTrustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5;

-- CreateTable
CREATE TABLE "AiTripGenerationJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "stage" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "resultTripId" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiTripGenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiTripGenerationJob_userId_idx" ON "AiTripGenerationJob"("userId");

-- CreateIndex
CREATE INDEX "AiTripGenerationJob_status_idx" ON "AiTripGenerationJob"("status");

-- CreateIndex
CREATE INDEX "AiTripGenerationJob_updatedAt_idx" ON "AiTripGenerationJob"("updatedAt");

-- AddForeignKey
ALTER TABLE "AiTripGenerationJob" ADD CONSTRAINT "AiTripGenerationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
