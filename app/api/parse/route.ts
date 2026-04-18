import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseRateLimit } from "@/lib/rateLimit";

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

interface ParsedItemRaw {
  item_name: string;
  price: number;
  unit?: string | null;
}

interface ParseResponse {
  items: ParsedItemRaw[];
  valid_from: string | null;
  valid_until: string | null;
  rateLimited?: boolean;
}

function safeParseResponse(text: string): ParseResponse {
  const empty = { items: [], valid_from: null, valid_until: null };

  try {
    const clean = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    // New format — object with items array and dates
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
      return {
        items: parsed.items.filter(
          (item: any): item is ParsedItemRaw =>
            typeof item.item_name === "string" &&
            typeof item.price === "number" &&
            item.price > 0,
        ),
        valid_from: parsed.valid_from ?? null,
        valid_until: parsed.valid_until ?? null,
      };
    }

    // Old format — plain array (fallback)
    if (Array.isArray(parsed)) {
      return {
        items: parsed.filter(
          (item): item is ParsedItemRaw =>
            typeof item.item_name === "string" &&
            typeof item.price === "number" &&
            item.price > 0,
        ),
        valid_from: null,
        valid_until: null,
      };
    }

    return empty;
  } catch {
    // Partial recovery — extract items with regex
    const itemRegex =
      /\{[^{}]*"item_name"\s*:\s*"[^"]+"\s*,[^{}]*"price"\s*:\s*[\d.]+[^{}]*\}/g;
    const matches = text.match(itemRegex);
    if (!matches?.length) return empty;

    const items: ParsedItemRaw[] = [];
    for (const match of matches) {
      try {
        const item = JSON.parse(match);
        if (
          typeof item.item_name === "string" &&
          typeof item.price === "number" &&
          item.price > 0
        )
          items.push(item);
      } catch {}
    }

    // Also try to extract dates from text even if JSON failed
    const datePattern = /(\d{4}-\d{2}-\d{2})/g;
    const dates = text.match(datePattern);

    return {
      items,
      valid_from: dates?.[0] ?? null,
      valid_until: dates?.[1] ?? null,
    };
  }
}

async function parseWithGemini(
  base64: string,
  mimeType: string,
): Promise<ParseResponse> {
  const prompt = `You are a grocery price extraction assistant.
Extract ALL products and their prices from this grocery flyer or catalogue.

Also extract the flyer validity dates if present (e.g. "Valid 23 March to 5 April", "Specials from Mon 1 Apr - Sun 7 Apr").

Return a JSON object with two keys:
1. "items" - array of products
2. "valid_from" - start date in YYYY-MM-DD format, or null if not found
3. "valid_until" - end date in YYYY-MM-DD format, or null if not found

Example response:
{
  "valid_from": "2025-03-23",
  "valid_until": "2025-04-05",
  "items": [
    {"item_name":"Full Cream Milk 2L","price":24.99,"unit":"2L"}
  ]
}

If a product has multiple sizes, list each separately.
If products come in combinations, list product combo and combo price.
If you cannot extract any items, return an empty array [].

If no validity dates are found, set both to null.
Return ONLY this JSON object, no other text, no markdown.
`;

  const isPdf = mimeType === "application/pdf";

  const filePart = isPdf
    ? {
        inline_data: {
          mime_type: "application/pdf",
          data: base64,
        },
      }
    : {
        inline_data: {
          mime_type: mimeType,
          data: base64,
        },
      };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }, filePart],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 65536,
        },
      }),
    },
  );

  const data = await response.json();
  console.log("Gemini status:", response.status);

  if (data.error) {
    console.error("Gemini API error:", data.error);
    return {
      items: [],
      valid_from: null,
      valid_until: null,
      rateLimited: data.error.code === 429,
    };
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.log("Gemini raw text preview:", text.slice(0, 300));
  return safeParseResponse(text);
}

/*
async function parseWithClaude(
  base64: string,
  mimeType: string,
): Promise<ParsedItemRaw[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64,
              },
            },
            {
              type: "text",
              text: `Extract ALL grocery items and prices from this document.
Return ONLY a valid JSON array, no other text, no markdown.
Format: [{"item_name":"...","price":0.00,"unit":"..."}]
Price must be a number in ZAR. Unit can be null.`,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  console.log("Claude status:", response.status);

  if (data.error) {
    console.error("Claude API error:", data.error);
    return [];
  }

  const text = data?.content?.[0]?.text ?? "";
  console.log("Claude raw text:", text.slice(0, 200));
  return safeParseJSON(text);
}
  */

export async function POST(request: Request) {
  try {
    const user = await getUser();
    console.log("User in parse route:", user?.id);

    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    // Rate limit check
    const { success, limit, reset, remaining } = await parseRateLimit.limit(
      user.id,
    );
    if (!success) {
      return NextResponse.json(
        {
          error: "Too many parse requests. Please wait before trying again.",
          retryAfter: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": new Date(reset).toISOString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const { docId, fileUrl, mimeType, fileHash } = body;

    console.log("Parse called:", { docId, mimeType, fileHash });

    // 1. Validate mimeType — never trust the client
    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPG, PNG, WebP and PDF are allowed.",
        },
        { status: 400 },
      );
    }

    // 2. Validate docId is a valid UUID
    if (
      !docId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        docId,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid document ID." },
        { status: 400 },
      );
    }

    // 3. Validate fileHash — SHA-256 is 64 hex chars
    //    Also allows the user-scoped variant (hash_userid8chars)
    if (!fileHash || !/^[a-f0-9]{64}(_[a-f0-9]{8})?$/.test(fileHash)) {
      return NextResponse.json(
        { error: "Invalid file hash." },
        { status: 400 },
      );
    }

    // 4. Validate fileUrl is from your own Supabase project
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    if (!fileUrl || !fileUrl.startsWith(SUPABASE_URL)) {
      return NextResponse.json({ error: "Invalid file URL." }, { status: 400 });
    }

    // 5. Verify the doc belongs to this user — prevent IDOR
    const { data: docOwner, error: ownerError } = await supabase
      .from("uploaded_docs")
      .select("id, user_id")
      .eq("id", docId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownerError || !docOwner) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    // Check cache — same file uploaded before
    const { data: existingDoc } = await supabase
      .from("uploaded_docs")
      .select("id, parsed")
      .eq("file_hash", fileHash)
      .eq("parsed", true)
      .neq("id", docId)
      .maybeSingle();

    if (existingDoc) {
      const { data: cachedItems } = await supabase
        .from("parsed_items")
        .select("*")
        .eq("doc_id", existingDoc.id);

      if (cachedItems && cachedItems.length > 0) {
        const newItems = cachedItems.map((item) => ({
          doc_id: docId,
          item_name: item.item_name,
          price: item.price,
          currency: item.currency,
        }));
        await supabase.from("parsed_items").insert(newItems);
        await supabase
          .from("uploaded_docs")
          .update({ parsed: true })
          .eq("id", docId);
        return NextResponse.json({
          items: newItems,
          cached: true,
          count: newItems.length,
        });
      }
    }

    // Extract the file path from the storage URL
    console.log("Full fileUrl:", fileUrl);
    const urlParts = fileUrl.split("/documents/");
    const filePath = urlParts[1];
    console.log("Extracted file path:", filePath);

    if (!filePath) {
      throw new Error("Could not extract file path from URL");
    }

    // Generate a signed URL the server can access without auth headers
    const { data: signedData, error: signedError } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 120);

    if (signedError || !signedData?.signedUrl) {
      console.error("Signed URL error:", signedError);
      throw new Error("Could not generate signed URL for document");
    }

    console.log("Signed URL generated successfully");

    // Fetch the file using the signed URL
    const fileResponse = await fetch(signedData.signedUrl);
    console.log("File fetch status:", fileResponse.status);
    console.log("File content-type:", fileResponse.headers.get("content-type"));

    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.status}`);
    }

    //Enforce file size server-side — 20MB max
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    const contentLength = fileResponse.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 20MB." },
        { status: 400 },
      );
    }

    const buffer = await fileResponse.arrayBuffer();
    console.log("File buffer size bytes:", buffer.byteLength);

    //Check the actual buffer size after download
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 20MB." },
        { status: 400 },
      );
    }

    //Reject empty files
    if (buffer.byteLength === 0) {
      return NextResponse.json(
        { error: "File appears to be empty." },
        { status: 400 },
      );
    }
    console.log("File buffer size:", buffer.byteLength);

    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64 = btoa(binary);
    console.log("Base64 length:", base64.length);

    // Parse with Gemini first
    let parseResult = await parseWithGemini(base64, mimeType);
    let items = parseResult.items;
    console.log("Gemini returned:", items.length, "items");

    // Fall back to Claude if Gemini returns too few
    /*
    if (items.length < 3) {
      console.log("Falling back to Claude...");
      items = await parseWithClaude(base64, mimeType);
      console.log("Claude returned:", items.length, "items");
    }
      */

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No items could be extracted from this document" },
        { status: 422 },
      );
    }

    const toInsert = items.map((item) => ({
      doc_id: docId,
      item_name: item.item_name,
      price: item.price,
      currency: "ZAR",
    }));

    const { data: savedItems, error: insertError } = await supabase
      .from("parsed_items")
      .insert(toInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    await supabase
      .from("uploaded_docs")
      .update({
        parsed: true,
        valid_from: parseResult.valid_from ?? null,
        valid_until: parseResult.valid_until ?? null,
      })
      .eq("id", docId);

    return NextResponse.json({
      items: savedItems,
      cached: false,
      count: savedItems?.length ?? 0,
      valid_from: parseResult.valid_from,
      valid_until: parseResult.valid_until,
    });
  } catch (error: any) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: error.message ?? "Parsing failed. Please try again." },
      { status: 500 },
    );
  }
}
