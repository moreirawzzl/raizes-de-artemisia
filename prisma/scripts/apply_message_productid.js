#!/usr/bin/env node
const { Client } = require('pg');

(async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set');
    process.exit(2);
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log('Connected to DB');

    await client.query(`ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "productId" TEXT`);
    console.log('Ensured column productId exists');

    await client.query(`CREATE INDEX IF NOT EXISTS "Message_productId_idx" ON "Message"("productId")`);
    console.log('Ensured index exists');

    const fkCheck = await client.query(
      `SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE c.contype = 'f' AND t.relname = 'Message' AND c.conname = 'Message_productId_fkey' LIMIT 1`
    );
    if (fkCheck.rowCount === 0) {
      try {
        await client.query(
          `ALTER TABLE "Message" ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE`
        );
        console.log('Added foreign key constraint');
      } catch (err) {
        console.error('Failed to add foreign key constraint (continuing):', err.message);
      }
    } else {
      console.log('Foreign key constraint already exists');
    }

    await client.end();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Error applying DB changes:', err.message);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
})();
