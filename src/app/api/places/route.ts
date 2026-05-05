import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geo";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (q.trim().length < 2) {
    return NextResponse.json({ places: [] });
  }

  try {
    const places = await searchPlaces(q, 6);
    return NextResponse.json({ places });
  } catch (e) {
    return NextResponse.json(
      { places: [], error: (e as Error).message },
      { status: 502 }
    );
  }
}
