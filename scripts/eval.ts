/**
 * Eval harness: runs the check pipeline over the labelled fixtures and reports
 * how many scams are caught and how many genuine offers are false-flagged.
 *   npm run eval
 */
import { runCheck } from "../lib/check";
import scams from "../fixtures/scams.json";
import genuine from "../fixtures/genuine.json";

async function main() {
  let caught = 0;
  const missed: string[] = [];
  for (const s of scams as { id: string; text: string }[]) {
    const r = await runCheck({ text: s.text });
    if (r.verdict === "scam" || r.verdict === "suspicious") caught++;
    else missed.push(s.id);
  }

  let falsePositives = 0;
  const fp: string[] = [];
  for (const g of genuine as { id: string; text: string }[]) {
    const r = await runCheck({ text: g.text });
    if (r.verdict === "scam") {
      falsePositives++;
      fp.push(g.id);
    }
  }

  const total = (scams as unknown[]).length;
  const pct = Math.round((caught / total) * 100);
  console.log(`\nScams caught:      ${caught}/${total} (${pct}%)`);
  if (missed.length) console.log(`  missed:          ${missed.join(", ")}`);
  console.log(`False positives:   ${falsePositives}/${(genuine as unknown[]).length}`);
  if (fp.length) console.log(`  flagged genuine: ${fp.join(", ")}`);
  console.log(
    `\nHackathon bar: >= 90% scams caught, 0 genuine marked Scam. ${
      pct >= 90 && falsePositives === 0 ? "PASS" : "not yet"
    }\n`,
  );
}

main();
