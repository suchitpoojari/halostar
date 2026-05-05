import { NextResponse } from "next/server";
import { createOrder, publicKeyId } from "@/lib/razorpay";
import { PRICING } from "@/types/vedic";
import type { RazorpayOrderRequest, RazorpayOrderResponse } from "@/types/vedic";

export const runtime = "nodejs";
export const maxDuration = 15;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: RazorpayOrderRequest;
  try {
    body = (await req.json()) as RazorpayOrderRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  if (!body.email || !EMAIL_RE.test(body.email) || body.email.length > 254) {
    return NextResponse.json({ ok: false, error: "valid email required" }, { status: 400 });
  }
  if (body.product !== "daily_vibe_unlock" && body.product !== "compatibility_unlock") {
    return NextResponse.json({ ok: false, error: "unknown product" }, { status: 400 });
  }

  const pricing = PRICING[body.product];

  try {
    const order = await createOrder({
      amountInPaise: pricing.amountInPaise,
      receipt: `halostar_${body.product}_${Date.now()}`,
      notes: { product: body.product, email: body.email.toLowerCase() },
    });

    const res: RazorpayOrderResponse = {
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      keyId: publicKeyId(),
      productLabel: pricing.label,
    };
    return NextResponse.json(res);
  } catch (e) {
    console.error("[razorpay/order]", e);
    return NextResponse.json({ ok: false, error: "couldn't create order. try again?" }, { status: 500 });
  }
}
