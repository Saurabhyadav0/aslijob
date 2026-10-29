import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCheck, saveReport } from "@/lib/store";

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

  const { checkId, scamType, amountLost } = parsed.data;
  const check = getCheck(checkId);
  const reportId = randomUUID();
  const complaintText = buildComplaint(scamType, amountLost ?? null);

  saveReport({
    reportId,
    checkId,
    scamType,
    amountLost: amountLost ?? null,
    complaintText,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ reportId, complaintText, linkedToCheck: Boolean(check) });
}

function buildComplaint(scamType: string, amountLost: number | null): string {
  const lost = amountLost ? `I have lost Rs ${amountLost}.` : "No money has been lost yet.";
  return [
    "To the National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in),",
    "",
    `I want to report a job-related ${scamType.replace("_", " ")} scam.`,
    lost,
    "The fraudster contacted me about a job offer and asked for payment / sensitive details.",
    "I request that this be investigated and the identifiers blocked.",
    "",
    "Details of the message and identifiers are attached.",
  ].join("\n");
}
