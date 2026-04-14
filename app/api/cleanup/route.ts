// src/app/api/cleanup/route.ts
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Verify this is called by your cron — add a secret header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Find expired docs — either past valid_until or older than 30 days
  const today = new Date().toISOString().split("T")[0];

  const { data: expiredByDate } = await supabase
    .from("uploaded_docs")
    .select("id, file_url")
    .lt("valid_until", today)
    .not("valid_until", "is", null);

  const { data: expiredByAge } = await supabase
    .from("uploaded_docs")
    .select("id, file_url")
    .lt(
      "created_at",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    )
    .is("valid_until", null);

  const allExpired = [...(expiredByDate ?? []), ...(expiredByAge ?? [])];

  if (!allExpired.length) {
    return NextResponse.json({ deleted: 0 });
  }

  // Delete storage files
  const filePaths = allExpired
    .map((doc) => doc.file_url?.split("/documents/")[1])
    .filter(Boolean) as string[];

  if (filePaths.length) {
    await supabase.storage.from("documents").remove(filePaths);
  }

  // Delete database records
  const ids = allExpired.map((d) => d.id);
  await supabase.from("uploaded_docs").delete().in("id", ids);

  console.log(`Deleted ${ids.length} expired documents`);
  return NextResponse.json({ deleted: ids.length });
}
