import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { event, telegram_id, payload } = await req.json();
    if (!event) {
      return NextResponse.json({ ok: false, error: "event is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    await supabase.from("analytics_events").insert({
      event,
      telegram_id: telegram_id ?? null,
      payload: payload ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Analytics failures should never surface to the user.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
