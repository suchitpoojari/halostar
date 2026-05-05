import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email).trim().toLowerCase()
      : "";

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "drop a real email bestie" },
      { status: 400 }
    );
  }

  console.log(
    JSON.stringify({ event: "waitlist_signup", email, ts: new Date().toISOString() })
  );

  return NextResponse.json({ ok: true });
}
