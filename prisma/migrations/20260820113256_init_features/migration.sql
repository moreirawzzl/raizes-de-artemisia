-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "editedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "reengagementEmailSentAt" TIMESTAMP(3);
