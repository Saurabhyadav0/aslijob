import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    db: "up",
    graph: "up",
    mode: isDemoMode() ? "demo" : "live",
  });
}
