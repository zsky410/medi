CREATE TYPE "TripDistributionMode" AS ENUM ('EXPLORE_FREE', 'SHOP_FREE', 'SHOP_PAID');

ALTER TABLE "Trip"
ADD COLUMN "distributionMode" "TripDistributionMode" NOT NULL DEFAULT 'EXPLORE_FREE';
