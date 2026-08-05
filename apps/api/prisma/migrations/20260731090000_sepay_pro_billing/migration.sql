-- CreateEnum
CREATE TYPE "ProPaymentIntentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELED');

-- DropIndex
DROP INDEX IF EXISTS "User_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripeCustomerId",
DROP COLUMN IF EXISTS "stripeSubscriptionId";

-- CreateTable
CREATE TABLE "ProPaymentIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" "ProPaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
    "checkoutCode" TEXT NOT NULL,
    "sepayTransactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProPaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProPaymentIntent_checkoutCode_key" ON "ProPaymentIntent"("checkoutCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProPaymentIntent_sepayTransactionId_key" ON "ProPaymentIntent"("sepayTransactionId");

-- CreateIndex
CREATE INDEX "ProPaymentIntent_userId_idx" ON "ProPaymentIntent"("userId");

-- CreateIndex
CREATE INDEX "ProPaymentIntent_status_idx" ON "ProPaymentIntent"("status");

-- AddForeignKey
ALTER TABLE "ProPaymentIntent" ADD CONSTRAINT "ProPaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
