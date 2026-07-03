-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "placeId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AffiliateClick_tripId_idx" ON "AffiliateClick"("tripId");

-- CreateIndex
CREATE INDEX "AffiliateClick_partner_idx" ON "AffiliateClick"("partner");

-- CreateIndex
CREATE INDEX "AffiliateClick_createdAt_idx" ON "AffiliateClick"("createdAt");
