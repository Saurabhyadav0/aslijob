import { NextRequest, NextResponse } from "next/server";
import { verifyEmployerDomain } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employerId, token } = body;

    if (!employerId || !token) {
      return NextResponse.json(
        { error: "employerId and token are required" },
        { status: 400 },
      );
    }

    const result = verifyEmployerDomain(employerId, token);
    if (!result.verified) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}

