-- CreateEnum
CREATE TYPE "ProBillingPeriod" AS ENUM ('WEEK', 'MONTH', 'YEAR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "proExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ProPaymentIntent"
ADD COLUMN "billingPeriod" "ProBillingPeriod" NOT NULL DEFAULT 'YEAR',
ADD COLUMN "durationDays" INTEGER NOT NULL DEFAULT 365;
