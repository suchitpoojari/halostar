import crypto from "node:crypto";
import Razorpay from "razorpay";

let client: Razorpay | null = null;
function razorpay(): Razorpay {
  if (client) return client;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) throw new Error("RAZORPAY_KEY_ID/SECRET not set");
  client = new Razorpay({ key_id, key_secret });
  return client;
}

export async function createOrder(params: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: "INR" }> {
  const order = await razorpay().orders.create({
    amount: params.amountInPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
  return { id: order.id, amount: typeof order.amount === "string" ? parseInt(order.amount, 10) : order.amount, currency: "INR" };
}

/**
 * Verify Razorpay payment success signature.
 * Razorpay docs: HMAC-SHA256(order_id + "|" + payment_id, key_secret) === signature.
 */
export function verifyPaymentSignature(args: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET not set");
  const body = `${args.razorpay_order_id}|${args.razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  // timing-safe compare
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(args.razorpay_signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function publicKeyId(): string {
  const k = process.env.RAZORPAY_KEY_ID;
  if (!k) throw new Error("RAZORPAY_KEY_ID not set");
  return k;
}
