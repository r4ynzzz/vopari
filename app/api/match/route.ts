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

    // Fetch all parsed items for this user across all parsed docs
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
          parsed,
          created_at
        )
      `,
      )
      .eq("uploaded_docs.user_id", user.id)
      .eq("uploaded_docs.parsed", true);

    if (parsedError) {
      console.error("Parsed items error:", parsedError);
      throw parsedError;
    }

    console.log("Total parsed items available:", parsedItems?.length);

    if (!parsedItems?.length)
      return NextResponse.json(
        { error: "No parsed flyers found. Upload a flyer first." },
        { status: 400 },
      );

    // Flatten parsed items for Fuse — include store info
    const searchableItems = parsedItems.map((item) => ({
      id: item.id,
      item_name: item.item_name,
      price: Number(item.price),
      currency: item.currency,
      doc_id: item.doc_id,
      store_name: (item.uploaded_docs as any)?.store_name ?? "Unknown store",
      doc_date: (item.uploaded_docs as any)?.created_at,
    }));

    // Set up Fuse fuzzy matching
    const fuse = new Fuse(searchableItems, {
      keys: ["item_name"],
      threshold: 0.45,
      includeScore: true,
      ignoreLocation: true,
    });

    // Match each list item and collect all candidates
    const results = listItems.map((listItem) => {
      const matches = fuse.search(listItem.item_name);

      if (!matches.length) {
        return {
          listItem: { id: listItem.id, item_name: listItem.item_name },
          matches: [],
          cheapest: null,
        };
      }

      // Build enriched match list
      const enriched = matches.map((m) => ({
        id: m.item.id,
        item_name: m.item.item_name,
        price: m.item.price,
        currency: m.item.currency,
        store_name: m.item.store_name,
        doc_date: m.item.doc_date,
        confidence: parseFloat((1 - (m.score ?? 1)).toFixed(2)),
      }));

      // Sort by price ascending — cheapest first
      enriched.sort((a, b) => a.price - b.price);

      // Remove duplicate stores — keep cheapest per store
      const seenStores = new Set<string>();
      const deduplicated = enriched.filter((m) => {
        if (seenStores.has(m.store_name)) return false;
        seenStores.add(m.store_name);
        return true;
      });

      return {
        listItem: { id: listItem.id, item_name: listItem.item_name },
        matches: deduplicated.slice(0, 5),
        cheapest: deduplicated[0],
      };
    });

    // Save best match per list item to price_matches table
    const toInsert = results
      .filter((r) => r.cheapest)
      .map((r) => ({
        list_item_id: r.listItem.id,
        parsed_item_id: r.cheapest!.id,
        confidence: r.cheapest!.confidence,
      }));

    if (toInsert.length > 0) {
      await supabase
        .from("price_matches")
        .delete()
        .in(
          "list_item_id",
          listItems.map((i) => i.id),
        );
      await supabase.from("price_matches").insert(toInsert);
    }

    // Summary stats
    const matchedCount = results.filter((r) => r.cheapest).length;
    const totalSaving = results
      .filter((r) => r.matches.length > 1)
      .reduce((acc, r) => {
        const cheapest = r.matches[0].price;
        const mostExpensive = r.matches[r.matches.length - 1].price;
        return acc + (mostExpensive - cheapest);
      }, 0);

    console.log("Match results:", matchedCount, "of", listItems.length);

    return NextResponse.json({
      results,
      summary: {
        totalItems: listItems.length,
        matchedItems: matchedCount,
        unmatchedItems: listItems.length - matchedCount,
        potentialSaving: parseFloat(totalSaving.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error("Match error:", error);
    return NextResponse.json(
      { error: error.message ?? "Matching failed" },
      { status: 500 },
    );
  }
}
