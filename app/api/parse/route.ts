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

interface ParsedItemRaw {
  item_name: string;
  price: number;
  unit?: string | null;
}

function safeParseJSON(text: string): ParsedItemRaw[] {
  try {
    const clean = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ParsedItemRaw =>
        typeof item.item_name === "string" &&
        typeof item.price === "number" &&
        item.price > 0,
    );
  } catch {
    return [];
  }
}

async function parseWithGemini(
  base64: string,
  mimeType: string,
): Promise<ParsedItemRaw[]> {
  const prompt = `You are a grocery price extraction assistant.
Extract ALL products and their prices from this grocery flyer or catalogue.
Return ONLY a valid JSON array with no other text, no markdown, no explanation.
Each item must have: item_name (string), price (number in ZAR), unit (string or null).
Example: [{"item_name":"Full Cream Milk 2L","price":24.99,"unit":"2L"}]
If a product has multiple sizes, list each separately.
If you cannot extract any items, return an empty array [].`;

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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_KEY}`,
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
          maxOutputTokens: 8192,
        },
      }),
    },
  );

  const data = await response.json();
  console.log("Gemini status:", response.status);

  if (data.error) {
    console.error("Gemini API error:", data.error);
    return [];
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  console.log("Gemini raw text preview:", text.slice(0, 300));
  return safeParseJSON(text);
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

    const supabase = createAdminClient();
    const body = await request.json();
    const { docId, fileUrl, mimeType, fileHash } = body;

    console.log("Parse called:", { docId, mimeType, fileHash });

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

    const buffer = await fileResponse.arrayBuffer();
    console.log("File buffer size bytes:", buffer.byteLength);

    if (buffer.byteLength === 0) {
      throw new Error("File is empty — storage fetch returned no data");
    }

    // Convert to base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const base64 = btoa(binary);
    console.log("Base64 length:", base64.length);

    // Parse with Gemini first
    let items = await parseWithGemini(base64, mimeType);
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
      .update({ parsed: true })
      .eq("id", docId);

    return NextResponse.json({
      items: savedItems,
      cached: false,
      count: savedItems?.length ?? 0,
    });
  } catch (error: any) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: error.message ?? "Parsing failed. Please try again." },
      { status: 500 },
    );
  }
}
