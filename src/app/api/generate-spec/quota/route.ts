import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const DEFAULT_LIMIT = 2;

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        used: 0,
        limit: DEFAULT_LIMIT,
        remaining: 0,
      });
    }

    const { data, error } = await supabase.rpc("spec_generation_quota", {
      max_per_day: DEFAULT_LIMIT,
    });

    if (error) {
      console.error("spec_generation_quota error:", error);
      return NextResponse.json(
        { error: "Не удалось получить лимит генераций" },
        { status: 500 }
      );
    }

    const row = data as {
      authenticated?: boolean;
      used?: number;
      limit?: number;
      remaining?: number;
    };

    return NextResponse.json({
      authenticated: row.authenticated ?? true,
      used: row.used ?? 0,
      limit: row.limit ?? DEFAULT_LIMIT,
      remaining: row.remaining ?? 0,
    });
  } catch (e) {
    console.error("GET generate-spec quota:", e);
    return NextResponse.json(
      { error: "Не удалось получить лимит генераций" },
      { status: 500 }
    );
  }
}
