import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCheck, getCheckIdentifiers, saveReport } from "@/lib/store";
import { getGraph } from "@/lib/graph";

export const runtime = "nodejs";

const Body = z.object({
  checkId: z.string().uuid(),
  scamType: z.enum(["fee", "task", "fake_letter", "overseas", "other"]).default("other"),
  amountLost: z.number().int().nonnegative().optional(),
  collegeId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_input", message: "Body must be JSON" } }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 },
    );
  }

  const { checkId, scamType, amountLost, collegeId } = parsed.data;
  const check = getCheck(checkId);
  const identifiers = getCheckIdentifiers(checkId);
  const reportId = randomUUID();
  const complaintText = buildComplaint(scamType, amountLost ?? null, identifiers);

  saveReport({
    reportId,
    checkId,
    scamType,
    amountLost: amountLost ?? null,
    complaintText,
    createdAt: new Date().toISOString(),
  });

  // Close the learning loop: add report and extracted identifiers into the fraud graph
  if (identifiers.length > 0) {
    getGraph().addReport({
      id: reportId,
      city: "Online",
      scam_type: scamType,
      status: "unverified",
      identifiers,
    });
  }

  // Trigger viaSocket webhook if configured
  if (process.env.VIASOCKET_WEBHOOK_URL) {
    try {
      void fetch(process.env.VIASOCKET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "report.created",
          reportId,
          checkId,
          scamType,
          amountLost: amountLost ?? null,
          collegeId: collegeId ?? null,
          identifierCount: identifiers.length,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {
      // Non-blocking outside call
    }
  }

  return NextResponse.json({
    reportId,
    complaintText,
    linkedToCheck: Boolean(check),
    identifiersLinked: identifiers.length,
  });
}

function buildComplaint(
  scamType: string,
  amountLost: number | null,
  identifiers: Array<{ kind: string; value: string }> = [],
): string {
  const lost = amountLost ? `I have lost Rs ${amountLost}.` : "No money has been lost yet.";
  const idList = identifiers.length > 0
    ? `Identified suspect channels: ${identifiers.map((i) => `${i.kind}: ${i.value}`).join(", ")}`
    : "Details of the message and identifiers are attached.";

  return [
    "To the National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in),",
    "",
    `I want to report a job-related ${scamType.replace("_", " ")} scam.`,
    lost,
    "The fraudster contacted me about a job offer and asked for payment / sensitive details.",
    "I request that this be investigated and the identifiers blocked.",
    "",
    idList,
  ].join("\n");
}
