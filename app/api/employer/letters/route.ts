import { NextRequest, NextResponse } from "next/server";
import { issueCompanyOfferLetter } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employerId, letterId, candidateEmail, role, salary, issueDate } = body;

    if (!employerId || !letterId || !candidateEmail || !role || !salary) {
      return NextResponse.json(
        { error: "employerId, letterId, candidateEmail, role, and salary are required" },
        { status: 400 },
      );
    }

    const res = issueCompanyOfferLetter(employerId, {
      letterId,
      candidateEmail,
      role,
      salary: Number(salary),
      issueDate,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        letter: res.letter,
        verificationUrl: `/verify?letterId=${res.letter?.id}`,
        contractAddress: "0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}
