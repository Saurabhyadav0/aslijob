/**
 * Apply supabase/graph.sql — the reports.city column, the report_identifiers
 * read policy, and the neighbour_risk() RPC that the running app calls. Uses the
 * shared IPv4-pooler connection so it works from a laptop. Safe to re-run.
 *
 *   npm run migrate:graph
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { connectAny } from "./_db";

async function main() {
  const client = await connectAny();
  try {
    const sql = readFileSync(join(process.cwd(), "supabase/graph.sql"), "utf-8");
    console.log("[migrate:graph] Applying supabase/graph.sql ...");
    await client.query(sql);
    console.log("[migrate:graph] Done.");

    const { rows } = await client.query(
      `SELECT proname FROM pg_proc WHERE proname = 'neighbour_risk'`,
    );
    console.log(`[migrate:graph] neighbour_risk present: ${rows.length > 0}`);
  } catch (err) {
    console.error("[migrate:graph] Error:", err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
