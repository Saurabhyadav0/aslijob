import { NextResponse } from "next/server";
import { verifyLetter } from "@/lib/letter";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const result = verifyLetter(params.id);
  return NextResponse.json(result);
}
