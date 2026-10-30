import { NextRequest, NextResponse } from "next/server";
import { verifyCandidateZkProof } from "@/lib/attest-meta";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proof } = body;

    if (!proof || !proof.letterId || !proof.letterHash) {
      return NextResponse.json(
        { error: "Valid CandidateZkProof payload required" },
        { status: 400 },
      );
    }

    const verification = verifyCandidateZkProof(proof);
    if (!verification.valid) {
      return NextResponse.json(
        {
          valid: false,
          reason: "Candidate cryptographic proof failed or offer letter record mismatch",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      valid: true,
      company: verification.company,
      role: verification.role,
      salaryHidden: true,
      message: "Offer letter authenticity verified with confidential salary preservation",
      contractAddress: "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}

