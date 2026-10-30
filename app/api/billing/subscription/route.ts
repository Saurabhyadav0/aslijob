import { NextRequest, NextResponse } from "next/server";
import { getCustomerSubscription, PLANS } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json(
      { error: "customerId query parameter required" },
      { status: 400 },
    );
  }

  const sub = getCustomerSubscription(customerId);
  const plan = PLANS[sub.planId] ?? PLANS.free_tier;

  return NextResponse.json({
    subscription: sub,
    plan,
  });
}
