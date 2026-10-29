import { Client } from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:Saurabh%401234@db.rqvwwudqyjoesvvgpfkx.supabase.co:5432/postgres";

  console.log("[Supabase Migration] Connecting to:", "db.rqvwwudqyjoesvvgpfkx.supabase.co:5432/postgres");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("[Supabase Migration] Connected successfully!");

    const schemaPath = join(__dirname, "../supabase/schema.sql");
    const sql = readFileSync(schemaPath, "utf-8");

    console.log("[Supabase Migration] Executing schema.sql...");
    await client.query(sql);

    console.log("[Supabase Migration] Schema executed successfully!");

    // Verify created tables
    const res = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log("[Supabase Migration] Public tables in database:");
    for (const row of res.rows) {
      console.log(` - ${row.tablename} (Row Security: ${row.rowsecurity})`);
    }
  } catch (err) {
    console.error("[Supabase Migration] Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
