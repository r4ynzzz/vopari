"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hashFile, fileToBase64 } from "@/lib/hash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ParsedItem } from "@/types";

type UploadState =
  | "idle"
  | "hashing"
  | "uploading"
  | "parsing"
  | "done"
  | "error";

const STATE_LABELS: Record<UploadState, string> = {
  idle: "Upload a flyer or catalogue",
  hashing: "Checking cache...",
  uploading: "Uploading document...",
  parsing: "AI is extracting prices...",
  done: "Done! Items extracted below.",
  error: "Something went wrong.",
};

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [storeName, setStoreName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [cached, setCached] = useState(false);
  const router = useRouter();

  const handleFile = useCallback((f: File) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowed.includes(f.type)) {
      toast.error("Please upload a JPG, PNG, WebP or PDF file");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB");
      return;
    }
    setFile(f);
    setParsedItems([]);
    setState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleUploadAndParse = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not signed in");
      return;
    }

    try {
      // Step 1: Hash the file
      setState("hashing");
      const fileHash = await hashFile(file);

      // Step 2: Upload file to Supabase Storage
      setState("uploading");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${fileHash}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(path);

      // Step 3: Create uploaded_docs record
      let doc = null;

      const { data: insertedDoc, error: docError } = await supabase
        .from("uploaded_docs")
        .insert({
          user_id: user.id,
          store_name: storeName.trim() || null,
          file_url: publicUrl,
          file_hash: fileHash,
          doc_type: file.type === "application/pdf" ? "pdf" : "image",
          parsed: false,
        })
        .select()
        .single();

      if (docError) {
        if (docError.code === "23505") {
          console.log(
            "Hash conflict — checking if this user already has this doc...",
          );

          // First check if THIS user already uploaded this file
          const { data: ownDoc } = await supabase
            .from("uploaded_docs")
            .select("*")
            .eq("file_hash", fileHash)
            .eq("user_id", user.id)
            .maybeSingle();

          if (ownDoc) {
            // User already uploaded this exact file
            if (ownDoc.parsed) {
              const { data: existingItems } = await supabase
                .from("parsed_items")
                .select("*")
                .eq("doc_id", ownDoc.id);

              if (existingItems?.length) {
                setParsedItems(existingItems);
                setCached(true);
                setState("done");
                toast.success(
                  `Loaded ${existingItems.length} items from cache`,
                );
                return;
              }
            }
            doc = ownDoc;
          } else {
            // A different user uploaded this file — create a new doc record
            // for this user with a slightly modified hash to avoid conflict
            console.log(
              "Different user uploaded same file — creating new record...",
            );
            const { data: newDoc, error: newDocError } = await supabase
              .from("uploaded_docs")
              .insert({
                user_id: user.id,
                store_name: storeName.trim() || null,
                file_url: publicUrl,
                file_hash: `${fileHash}_${user.id.slice(0, 8)}`,
                doc_type: file.type === "application/pdf" ? "pdf" : "image",
                parsed: false,
              })
              .select()
              .single();

            if (newDocError || !newDoc) {
              console.error("New doc insert error:", newDocError);
              throw new Error("Failed to create document record");
            }

            doc = newDoc;
          }
        } else {
          console.error("Doc insert error:", docError);
          throw new Error(`Failed to create document: ${docError.message}`);
        }
      } else {
        doc = insertedDoc;
      }

      // At this point doc is guaranteed to be non-null
      console.log("Doc id:", doc.id);

      // Step 4: Convert to base64 and call parse API
      setState("parsing");

      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: doc.id,
          fileUrl: publicUrl, // ← send the URL, not base64
          mimeType: file.type,
          fileHash,
        }),
      });
      {
        console.log("API response", res);
      }
      if (!res.ok) {
        const err = await res.json();
        // Handle rate limit specifically
        if (res.status === 429) {
          setState("error");
          toast.error(
            "Too many uploads. Please wait a few minutes before trying again.",
          );
          return;
        }
        throw new Error(err.error || "Parse failed");
      }

      const result = await res.json();
      setParsedItems(result.items);
      setCached(result.cached);
      setState("done");

      const msg = result.cached
        ? `Loaded ${result.count} items from cache`
        : `Extracted ${result.count} items`;
      toast.success(msg);
    } catch (err: any) {
      console.error(err);
      setState("error");
      toast.error(err.message || "Something went wrong");
    }
  };

  const isLoading = ["hashing", "uploading", "parsing"].includes(state);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Upload a flyer</h1>

      <div className="space-y-4">
        <Input
          required
          placeholder="Store name (optional — e.g. Checkers, Pick n Pay)"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
            ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}
            ${file ? "bg-emerald-50 border-emerald-300" : ""}`}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
          {file ? (
            <div>
              <p className="font-medium text-emerald-700">{file.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(1)} MB · Click to change
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 font-medium">
                Drop a flyer here or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-1">
                JPG, PNG, WebP or PDF · Max 20MB
              </p>
            </div>
          )}
        </div>

        {/* Status message */}
        {state !== "idle" && (
          <div
            className={`text-sm px-4 py-3 rounded-lg
            ${state === "done" ? "bg-emerald-50 text-emerald-700" : ""}
            ${state === "error" ? "bg-red-50 text-red-600" : ""}
            ${isLoading ? "bg-blue-50 text-blue-600" : ""}`}
          >
            {isLoading && (
              <span className="inline-block animate-pulse mr-2">...</span>
            )}
            {STATE_LABELS[state]}
          </div>
        )}

        <Button
          onClick={handleUploadAndParse}
          disabled={!file || isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? STATE_LABELS[state] : "Extract prices"}
        </Button>
      </div>

      {/* Parsed items preview */}
      {parsedItems.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-semibold">Extracted items</h2>
            <Badge variant="secondary">{parsedItems.length}</Badge>
            {cached && (
              <Badge className="bg-emerald-100 text-emerald-700">
                From cache
              </Badge>
            )}
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {parsedItems.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm">{item.item_name}</span>
                    <span className="text-sm font-medium text-emerald-700">
                      R{Number(item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => router.push("/dashboard/results")}
          >
            Compare against my list →
          </Button>
        </div>
      )}
    </div>
  );
}
