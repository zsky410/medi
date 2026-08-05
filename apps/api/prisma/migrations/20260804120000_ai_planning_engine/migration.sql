-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "generationMetadata" JSONB;

-- CreateTable
CREATE TABLE "PlaceCatalog" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "category" "PlaceCategory" NOT NULL DEFAULT 'OTHER',
    "sourceMetadata" JSONB,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "lastResolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaceCatalog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Place" ADD COLUMN "placeCatalogId" TEXT,
ADD COLUMN "estimatedDurationMinutes" INTEGER,
ADD COLUMN "generationScore" DOUBLE PRECISION,
ADD COLUMN "generationMetadata" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "PlaceCatalog_providerId_key" ON "PlaceCatalog"("providerId");

-- CreateIndex
CREATE INDEX "PlaceCatalog_normalizedName_idx" ON "PlaceCatalog"("normalizedName");

-- CreateIndex
CREATE INDEX "PlaceCatalog_category_idx" ON "PlaceCatalog"("category");

-- CreateIndex
CREATE INDEX "PlaceCatalog_lat_lng_idx" ON "PlaceCatalog"("lat", "lng");

-- CreateIndex
CREATE INDEX "Place_placeCatalogId_idx" ON "Place"("placeCatalogId");

-- CreateIndex
CREATE INDEX "Place_providerId_idx" ON "Place"("providerId");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_placeCatalogId_fkey" FOREIGN KEY ("placeCatalogId") REFERENCES "PlaceCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
