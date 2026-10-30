import { NextRequest, NextResponse } from "next/server";
import {
  createFreezeAdvisory,
  getFreezeAdvisories,
  updateFreezeStatus,
  BankPartnerId,
} from "@/lib/banking-freeze";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vpa, victimIncidents, bankId } = body;

    if (!vpa || !Array.isArray(victimIncidents) || victimIncidents.length === 0) {
      return NextResponse.json(
        { error: "vpa and non-empty victimIncidents array are required" },
        { status: 400 },
      );
    }

    const res = createFreezeAdvisory({ vpa, victimIncidents, bankId });
    if (!res.success) {
      return NextResponse.json(
        { eligible: false, message: res.message },
        { status: 422 },
      );
    }

    return NextResponse.json({ ok: true, advisory: res.advisory }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bankId = searchParams.get("bankId") as BankPartnerId | null;

  const advisories = getFreezeAdvisories(bankId ?? undefined);
  return NextResponse.json({ count: advisories.length, advisories });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { noticeId, status } = body;

    if (!noticeId || !status || !["acknowledged", "lien_placed"].includes(status)) {
      return NextResponse.json(
        { error: "noticeId and status ('acknowledged' | 'lien_placed') are required" },
        { status: 400 },
      );
    }

    const success = updateFreezeStatus(noticeId, status);
    if (!success) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, noticeId, status });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}

