DO $$
BEGIN
  -- add column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'Message' AND column_name = 'productId'
  ) THEN
    ALTER TABLE "Message" ADD COLUMN "productId" TEXT;
  END IF;

  -- add foreign key constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Message_productId_fkey' AND table_name = 'Message'
  ) THEN
    ALTER TABLE "Message" ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- create index if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Message_productId_idx'
  ) THEN
    CREATE INDEX "Message_productId_idx" ON "Message"("productId");
  END IF;
END $$;