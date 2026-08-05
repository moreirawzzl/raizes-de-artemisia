-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "revenueResetAt" TIMESTAMP(3),

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);
