import { NextRequest, NextResponse } from "next/server";
import { generateCyberDossier, getDossier, listDossiers } from "@/lib/complaints";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      state,
      city,
      jobScamType,
      suspectPhones,
      suspectUpis,
      amountLostInr,
      incidentDate,
      narrative,
    } = body;

    if (!state || !city || !jobScamType || !narrative) {
      return NextResponse.json(
        { error: "state, city, jobScamType, and narrative are required" },
        { status: 400 },
      );
    }

    const dossier = generateCyberDossier({
      state,
      city,
      jobScamType,
      claimedCompany: body.claimedCompany,
      suspectPhones: Array.isArray(suspectPhones) ? suspectPhones : [],
      suspectUpis: Array.isArray(suspectUpis) ? suspectUpis : [],
      suspectWallets: Array.isArray(body.suspectWallets) ? body.suspectWallets : [],
      suspectUrls: Array.isArray(body.suspectUrls) ? body.suspectUrls : [],
      suspectTelegramHandles: Array.isArray(body.suspectTelegramHandles)
        ? body.suspectTelegramHandles
        : [],
      amountLostInr: Number(amountLostInr) || 0,
      utrOrTransactionIds: Array.isArray(body.utrOrTransactionIds)
        ? body.utrOrTransactionIds
        : [],
      incidentDate: incidentDate || new Date().toISOString().slice(0, 10),
      narrative,
    });

    return NextResponse.json({ ok: true, dossier }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const state = searchParams.get("state");

  if (id) {
    const dossier = getDossier(id);
    if (!dossier) {
      return NextResponse.json({ error: "Dossier not found" }, { status: 404 });
    }
    return NextResponse.json({ dossier });
  }

  const list = listDossiers(state ?? undefined);
  return NextResponse.json({ count: list.length, dossiers: list });
}

