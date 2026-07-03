-- CreateTable Guide
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "purchaseCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable GuidePurchase
CREATE TABLE "GuidePurchase" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "clonedTripId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuidePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Guide_creatorId_idx" ON "Guide"("creatorId");
CREATE INDEX "Guide_tripId_idx" ON "Guide"("tripId");
CREATE INDEX "Guide_published_idx" ON "Guide"("published");
CREATE INDEX "GuidePurchase_buyerId_idx" ON "GuidePurchase"("buyerId");
CREATE UNIQUE INDEX "GuidePurchase_guideId_buyerId_key" ON "GuidePurchase"("guideId", "buyerId");

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuidePurchase" ADD CONSTRAINT "GuidePurchase_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuidePurchase" ADD CONSTRAINT "GuidePurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
