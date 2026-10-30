import { NextRequest, NextResponse } from "next/server";
import { getRecruiters, addRecruiter, revokeRecruiter } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get("employerId") || "tcs";
  const recruiters = getRecruiters(employerId);
  return NextResponse.json({ recruiters });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employerId, name, email, role, linkedinUrl } = body;

    if (!employerId || !name || !email || !role) {
      return NextResponse.json(
        { error: "employerId, name, email, and role are required" },
        { status: 400 },
      );
    }

    const res = addRecruiter(employerId, { name, email, role, linkedinUrl });
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ recruiter: res.recruiter }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { employerId, recruiterId } = body;

    if (!employerId || !recruiterId) {
      return NextResponse.json(
        { error: "employerId and recruiterId are required" },
        { status: 400 },
      );
    }

    const success = revokeRecruiter(employerId, recruiterId);
    if (!success) {
      return NextResponse.json(
        { error: "Recruiter badge not found or could not be revoked" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, status: "revoked" });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}
