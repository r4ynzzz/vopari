"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmText !== "delete my account") {
      toast.error('Please type "delete my account" to confirm');
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete account");
      }

      // Sign out locally and redirect to home
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/?deleted=true");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your account preferences
      </p>

      {/* Account info */}
      <Card className="border-gray-100 mb-6">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">Account</p>
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Plan</span>
              <span className="font-medium text-gray-700">Free (Beta)</span>
            </div>
            <div className="flex justify-between">
              <span>Data</span>
              <span className="font-medium text-gray-700">
                Stored securely in South Africa
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="mb-6 bg-gray-100" />

      {/* Danger zone */}
      <div>
        <p className="text-sm font-medium text-red-600 mb-1">Danger zone</p>
        <p className="text-xs text-gray-400 mb-4">
          These actions are permanent and cannot be undone.
        </p>

        <Card className="border-red-100 bg-red-50/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  Delete account
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Permanently deletes your account, all grocery lists, uploaded
                  flyers and extracted price data. This cannot be reversed.
                </p>
              </div>
              {!confirming && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shrink-0"
                  onClick={() => setConfirming(true)}
                >
                  Delete
                </Button>
              )}
            </div>

            {/* Confirmation input */}
            {confirming && (
              <div className="mt-5 pt-5 border-t border-red-100">
                <p className="text-xs text-gray-600 mb-3">
                  Type{" "}
                  <span className="font-mono font-medium text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">
                    delete my account
                  </span>{" "}
                  to confirm:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                  className="mb-3 border-red-200 focus:ring-red-400"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setConfirming(false);
                      setConfirmText("");
                    }}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteAccount}
                    disabled={deleting || confirmText !== "delete my account"}
                  >
                    {deleting ? "Deleting..." : "Permanently delete"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
