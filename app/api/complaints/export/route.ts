import { NextRequest, NextResponse } from "next/server";
import { getDossier, listDossiers } from "@/lib/complaints";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const format = searchParams.get("format") || "text";

  if (!id) {
    return NextResponse.json(
      { error: "Dossier id query parameter is required" },
      { status: 400 },
    );
  }

  const dossier = getDossier(id);
  if (!dossier) {
    return NextResponse.json({ error: "Dossier not found" }, { status: 404 });
  }

  if (format === "text") {
    return new NextResponse(dossier.formalComplaintDraft, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="NCRP_Complaint_${dossier.acknowledgementNumber.replace(/[\/]/g, "_")}.txt"`,
      },
    });
  }

  return NextResponse.json(dossier);
}

