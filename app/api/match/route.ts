// src/app/api/match/route.ts — full replacement

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

// Normalise item names for better comparison
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

// Extract key product tokens — brand, type, size
function tokenise(name: string): string[] {
  return normalise(name)
    .split(" ")
    .filter((w) => w.length > 2);
}

// Fast pre-filter — returns items that share at least one meaningful token
function preFilter(
  listItemName: string,
  parsedItems: any[],
  limit = 30,
): any[] {
  const tokens = tokenise(listItemName);
  if (!tokens.length) return parsedItems.slice(0, limit);

  const scored = parsedItems.map((item) => {
    const itemTokens = tokenise(item.item_name);
    const shared = tokens.filter((t) =>
      itemTokens.some((it) => it.includes(t) || t.includes(it)),
    ).length;
    return { item, score: shared };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top candidates — at least those with 1 shared token
  const withMatch = scored.filter((s) => s.score > 0);
  if (withMatch.length >= 3)
    return withMatch.slice(0, limit).map((s) => s.item);

  // If not enough token matches, return top items anyway
  return scored.slice(0, limit).map((s) => s.item);
}

// LLM semantic matching — finds best matches from candidates
async function semanticMatch(
  listItemName: string,
  candidates: any[],
): Promise<any[]> {
  if (!candidates.length) return [];

  const candidateList = candidates
    .map(
      (c, i) =>
        `${i}: "${c.item_name}" R${Number(c.price).toFixed(2)} at ${c.store_name}`,
    )
    .join("\n");

  console.log(
    `\nMatching "${listItemName}" against ${candidates.length} candidates`,
  );
  console.log("Top 5 candidates:");
  candidates
    .slice(0, 5)
    .forEach((c, i) =>
      console.log(`  ${i}: ${c.item_name} — R${Number(c.price).toFixed(2)}`),
    );

  const prompt = `You are a grocery price comparison assistant for South African stores.

The shopper is looking for: "${listItemName}"

Available products from flyers:
${candidateList}

Task: Find all products that are the same grocery item the shopper is looking for.
Rules:
- Different brands of the same product count as matches (e.g. "Clover Milk" matches "milk")
- Different sizes count as matches (e.g. "Milk 1L" matches "milk 2L")  
- Completely different products do NOT match (e.g. "condensed milk" does NOT match "fresh milk")
- Return ONLY a JSON array of index numbers, nothing else
- If no matches exist return []

Examples:
- Shopper wants "milk" → matches "Full Cream Milk 2L", "Clover Long Life Milk 1L" → [0,3]
- Shopper wants "white bread" → matches "Albany White Bread 700g" → [2]
- Shopper wants "eggs" → no egg products available → []

Reply with ONLY the array like [0,1,3] or []`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 128,
          },
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini error:", data.error.message);
      return [];
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log(`Gemini response for "${listItemName}":`, text.trim());
    console.log(`Raw Gemini response:`, JSON.stringify(text));

    // Extract array from response — handles extra text around it
    const arrayMatch = text.match(/\[[\d\s,]*\]/);
    if (!arrayMatch) {
      console.log("No array found in response");
      return [];
    }

    const indices: number[] = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(indices)) return [];

    const matched = indices
      .filter((i) => typeof i === "number" && i >= 0 && i < candidates.length)
      .map((i) => candidates[i]);

    console.log(`Matched ${matched.length} items for "${listItemName}"`);
    return matched;
  } catch (err) {
    console.error("Semantic match error:", err);
    return [];
  }
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

    // Fetch all parsed items for this user
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

    if (parsedError) throw parsedError;
    if (!parsedItems?.length)
      return NextResponse.json(
        { error: "No parsed flyers found. Upload a flyer first." },
        { status: 400 },
      );

    // Flatten with store info
    const searchableItems = parsedItems.map((item) => ({
      id: item.id,
      item_name: item.item_name,
      price: Number(item.price),
      currency: item.currency,
      doc_id: item.doc_id,
      store_name: (item.uploaded_docs as any)?.store_name ?? "Unknown store",
      doc_date: (item.uploaded_docs as any)?.created_at,
    }));

    console.log(
      `Matching ${listItems.length} list items against ${searchableItems.length} parsed items`,
    );

    // Match each list item using pre-filter + semantic matching
    const results = await Promise.all(
      listItems.map(async (listItem) => {
        console.log(`Matching: "${listItem.item_name}"`);

        // Step 1: Pre-filter to get top candidates via token matching
        const candidates = preFilter(listItem.item_name, searchableItems);
        console.log(`  Pre-filter: ${candidates.length} candidates`);

        // Step 2: Semantic match using LLM
        const matched = await semanticMatch(listItem.item_name, candidates);
        console.log(`  Semantic: ${matched.length} matches`);

        if (!matched.length) {
          return {
            listItem: { id: listItem.id, item_name: listItem.item_name },
            matches: [],
            cheapest: null,
          };
        }

        // Deduplicate by store — keep cheapest per store
        const seenStores = new Set<string>();
        const deduplicated = matched
          .sort((a, b) => a.price - b.price)
          .filter((m) => {
            if (seenStores.has(m.store_name)) return false;
            seenStores.add(m.store_name);
            return true;
          });

        return {
          listItem: { id: listItem.id, item_name: listItem.item_name },
          matches: deduplicated.slice(0, 5),
          cheapest: deduplicated[0],
        };
      }),
    );

    // Save best matches to price_matches table
    const toInsert = results
      .filter((r) => r.cheapest)
      .map((r) => ({
        list_item_id: r.listItem.id,
        parsed_item_id: r.cheapest!.id,
        confidence: 0.95,
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
