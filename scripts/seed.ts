/**
 * Seed script. In demo mode the in-memory store/graph auto-seed from fixtures/
 * at runtime, so this just reports what would be loaded. When Supabase +
 * TigerGraph adapters are wired, this writes the fixtures into them.
 *   npm run seed
 */
import companies from "../fixtures/companies.json";
import graphSeed from "../fixtures/graph_seed.json";
import scams from "../fixtures/scams.json";

const reports = (graphSeed as { reports: unknown[] }).reports.length;
console.log("Demo data available to the in-memory store/graph:");
console.log(`  companies:      ${(companies as unknown[]).length}`);
console.log(`  seed reports:   ${reports}`);
console.log(`  scam samples:   ${(scams as unknown[]).length}`);
console.log("\nDemo mode seeds these automatically on first request. No external store needed.");
