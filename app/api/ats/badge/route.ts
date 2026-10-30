import { NextRequest, NextResponse } from "next/server";
import { generateJobBoardSeal } from "@/lib/ats";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get("employerId") || "tcs";
  const format = searchParams.get("format");

  const seal = generateJobBoardSeal(employerId);

  if (format === "html") {
    return new NextResponse(seal.embedBadgeHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json(seal);
}

