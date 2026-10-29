import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DODO_API_KEY =
  process.env.DODO_API_KEY ||
  "dodo_test_VWGZBo5xpt9I2RR0.xhokHeJctt7TlaSWAmfx111rQYTlFkOk2gpOv3knhCcB9X0z";

const DODO_PRODUCT_ID =
  process.env.DODO_PRODUCT_ID || "pdt_0NqorZWwGmzJKNIvfznVx";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // optional body
    }

    const studentCount = Number(body?.studentCount) || 500;
    const origin = req.headers.get("origin") || "https://aslijob.vercel.app";

    const dodoRes = await fetch("https://test.dodopayments.com/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: DODO_PRODUCT_ID,
            quantity: Math.max(1, Math.round(studentCount / 500)),
          },
        ],
        billing_address: {
          country: "IN",
        },
        return_url: `${origin}/pricing?status=success&batch=${encodeURIComponent(body?.collegeName || "Campus-Batch")}`,
      }),
    });

    if (!dodoRes.ok) {
      const errText = await dodoRes.text();
      console.error("[Dodo Checkout Error]:", errText);
      return NextResponse.json(
        { error: { message: "Failed to create Dodo checkout session" } },
        { status: 502 },
      );
    }

    const session = await dodoRes.json();
    return NextResponse.json({
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err?.message || "Internal error" } },
      { status: 500 },
    );
  }
}
