import { NextRequest, NextResponse } from "next/server";
import {
  submitBountyClaim,
  getBountyClaim,
  listBountyClaims,
  BountyClaimInput,
} from "@/lib/bounty";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: BountyClaimInput = await req.json();
    const {
      hunterName,
      hunterEmail,
      payoutMethod,
      payoutAddressOrHandle,
      scamCategory,
      suspectIdentifiers,
      evidenceText,
    } = body;

    if (
      !hunterName ||
      !hunterEmail ||
      !payoutMethod ||
      !payoutAddressOrHandle ||
      !scamCategory ||
      !Array.isArray(suspectIdentifiers) ||
      suspectIdentifiers.length === 0 ||
      !evidenceText
    ) {
      return NextResponse.json(
        { error: "Missing required bounty claim fields" },
        { status: 400 },
      );
    }

    const claim = submitBountyClaim(body);
    return NextResponse.json({ ok: true, claim }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid bounty claim payload" },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const email = searchParams.get("hunterEmail");

  if (id) {
    const claim = getBountyClaim(id);
    if (!claim) {
      return NextResponse.json({ error: "Bounty claim not found" }, { status: 404 });
    }
    return NextResponse.json({ claim });
  }

  const claims = listBountyClaims(email ?? undefined);
  return NextResponse.json({ count: claims.length, claims });
}

