import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function deleteDoc(docId: string, fileUrl: string, userId: string) {
  "use server";

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Extract file path from URL for storage deletion
  const pathMatch = fileUrl.split("/documents/");
  const filePath = pathMatch[1];

  // Delete from storage if path found
  if (filePath) {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([filePath]);
    if (storageError) console.error("Storage delete error:", storageError);
  }

  // Delete doc record — cascades to parsed_items and price_matches
  const { error } = await supabase
    .from("uploaded_docs")
    .delete()
    .eq("id", docId)
    .eq("user_id", userId);

  if (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete document");
  }

  revalidatePath("/dashboard/documents");
}

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: docs } = await supabase
    .from("uploaded_docs")
    .select(
      `
      id,
      store_name,
      doc_type,
      parsed,
      file_url,
      created_at,
      parsed_items(count)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const formatDate = (dateStr: string) => {
    const daysAgo = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return `${daysAgo} days ago`;
  };

  const getDaysOld = (dateStr: string) =>
    Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
    );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Uploaded flyers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {docs?.length ?? 0} flyer{docs?.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/dashboard/upload">Upload new</Link>
        </Button>
      </div>

      {!docs?.length && (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm mb-3">No flyers uploaded yet</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/upload">Upload your first flyer</Link>
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {docs?.map((doc) => {
          const itemCount = (doc.parsed_items as any)?.[0]?.count ?? 0;
          const daysOld = getDaysOld(doc.created_at);
          const isStale = daysOld > 14;
          const isExpired = daysOld > 30;

          return (
            <Card
              key={doc.id}
              className={
                isExpired
                  ? "opacity-40 border-red-100"
                  : isStale
                    ? "opacity-60"
                    : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {doc.store_name ?? "Unnamed store"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {formatDate(doc.created_at)}
                      </span>
                      {isExpired && (
                        <span className="text-xs text-red-400 font-medium">
                          · Expired
                        </span>
                      )}
                      {!isExpired && isStale && (
                        <span className="text-xs text-amber-500">
                          · Prices may be outdated
                        </span>
                      )}
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400 uppercase">
                        {doc.doc_type ?? "file"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {itemCount} items
                    </Badge>
                    {doc.parsed ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        Parsed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    )}

                    {/* Delete button */}
                    <form
                      action={async () => {
                        "use server";
                        await deleteDoc(doc.id, doc.file_url ?? "", user.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1 py-1 rounded"
                        title="Delete flyer"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </div>

                {isExpired && (
                  <p className="text-xs text-red-400 mt-2">
                    This flyer is over 30 days old and prices are no longer
                    reliable. Delete it and upload a fresh one.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {docs && docs.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-6">
          Prices older than 14 days may not reflect current specials. Flyers
          older than 30 days are considered expired.
        </p>
      )}
    </div>
  );
}
