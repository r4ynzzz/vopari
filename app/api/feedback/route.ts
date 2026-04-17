// src/app/api/feedback/route.ts

import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function createAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await request.json();
    const {
      nps_score,
      ai_accuracy,
      stores_used,
      shopping_frequency,
      biggest_frustration,
      feature_priority,
      willingness_to_pay,
      deal_sources,
      ease_of_use,
      one_improvement,
    } = body;

    // Basic validation
    if (nps_score === undefined || nps_score < 0 || nps_score > 10) {
      return NextResponse.json({ error: "Invalid NPS score" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user already submitted feedback this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: existing } = await supabase
      .from("user_feedback")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString())
      .maybeSingle();

    if (existing) {
      // Update existing feedback rather than duplicate
      await supabase
        .from("user_feedback")
        .update({
          nps_score,
          ai_accuracy,
          stores_used,
          shopping_frequency,
          biggest_frustration,
          feature_priority,
          willingness_to_pay,
          deal_sources,
          ease_of_use,
          one_improvement,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      const { error: insertError } = await supabase
        .from("user_feedback")
        .insert({
          user_id: user.id,
          nps_score,
          ai_accuracy,
          stores_used,
          shopping_frequency,
          biggest_frustration,
          feature_priority,
          willingness_to_pay,
          deal_sources,
          ease_of_use,
          one_improvement,
        });

      if (insertError) {
        console.error("Feedback insert error:", insertError);
        throw insertError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to save feedback" },
      { status: 500 },
    );
  }
}
