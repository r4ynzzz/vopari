"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="h-10 px-4 text-sm font-medium text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shrink-0"
    >
      Sign out
    </Button>
  );
}
