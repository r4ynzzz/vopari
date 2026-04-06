import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Fuse from "fuse.js";

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

    const supabase = createAdminClient();
    const { listId } = await request.json();

    if (!listId)
      return NextResponse.json(
        { error: "listId is required" },
        { status: 400 },
      );

    // Fetch list items
    const { data: listItems, error: listError } = await supabase
      .from("list_items")
      .select("*")
      .eq("list_id", listId);

    if (listError) throw listError;
    if (!listItems?.length)
      return NextResponse.json(
        { error: "No items in this list" },
        { status: 400 },
      );

    // Fetch all parsed items for this user across all docs
    const { data: parsedItems, error: parsedError } = await supabase
      .from("parsed_items")
      .select(
        `
        id,
        item_name,
        price,
        currency,
        doc_id,
        uploaded_docs!inner (
          id,
          user_id,
          store_name,
          parsed
        )
      `,
      )
      .eq("uploaded_docs.user_id", user.id)
      .eq("uploaded_docs.parsed", true);

    if (parsedError) throw parsedError;
    if (!parsedItems?.length)
      return NextResponse.json(
        { error: "No parsed flyers found. Upload a flyer first." },
        { status: 400 },
      );

    // Fuzzy match each list item against all parsed items
    const fuse = new Fuse(parsedItems, {
      keys: ["item_name"],
      threshold: 0.4,
      includeScore: true,
    });

    const results = listItems.map((listItem) => {
      const matches = fuse.search(listItem.item_name);

      if (!matches.length) return { listItem, matches: [] };

      const enriched = matches.map((m) => ({
        id: m.item.id,
        item_name: m.item.item_name,
        price: m.item.price,
        currency: m.item.currency,
        confidence: parseFloat((1 - (m.score ?? 1)).toFixed(2)),
        store_name:
          (m.item as any).uploaded_docs?.store_name ?? "Unknown store",
      }));

      // Sort cheapest first
      enriched.sort((a, b) => Number(a.price) - Number(b.price));

      return { listItem, matches: enriched.slice(0, 5) };
    });

    // Save best match per list item to price_matches table
    const toInsert = results
      .filter((r) => r.matches.length > 0)
      .map((r) => ({
        list_item_id: r.listItem.id,
        parsed_item_id: r.matches[0].id,
        confidence: r.matches[0].confidence,
      }));

    if (toInsert.length > 0) {
      // Clear old matches for this list first
      await supabase
        .from("price_matches")
        .delete()
        .in(
          "list_item_id",
          listItems.map((i) => i.id),
        );

      await supabase.from("price_matches").insert(toInsert);
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Match error:", error);
    return NextResponse.json(
      { error: error.message ?? "Matching failed" },
      { status: 500 },
    );
  }
}
