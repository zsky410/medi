-- Remove admin-only audit log table.
DROP TABLE IF EXISTS "AdminAuditLog";

-- Normalize legacy admin users before shrinking the enum.
UPDATE "User" SET "role" = 'USER' WHERE "role" = 'ADMIN';

-- Recreate the enum without ADMIN.
ALTER TYPE "SystemRole" RENAME TO "SystemRole_old";
CREATE TYPE "SystemRole" AS ENUM ('USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "SystemRole" USING "role"::text::"SystemRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
DROP TYPE "SystemRole_old";
