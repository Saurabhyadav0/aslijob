import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PlanId, PLANS } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, customerType, customerEmail, planId } = body;

    if (!customerId || !customerType || !customerEmail || !planId) {
      return NextResponse.json(
        { error: "customerId, customerType, customerEmail, and planId are required" },
        { status: 400 },
      );
    }

    if (!PLANS[planId as PlanId]) {
      return NextResponse.json(
        { error: `Invalid planId. Allowed: ${Object.keys(PLANS).join(", ")}` },
        { status: 400 },
      );
    }

    const session = createCheckoutSession({
      customerId,
      customerType,
      customerEmail,
      planId: planId as PlanId,
    });

    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}
