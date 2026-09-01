-- Add productId to Message to support linking messages to products
ALTER TABLE "Message" ADD COLUMN "productId" TEXT;

-- Add foreign key constraint linking to Product(id). Allow NULLs; set to NULL on delete of product.
ALTER TABLE "Message" ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional index for queries by productId
CREATE INDEX IF NOT EXISTS "Message_productId_idx" ON "Message"("productId");

