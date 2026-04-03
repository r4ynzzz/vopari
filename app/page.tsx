import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <h1 className="text-4xl font-semibold text-emerald-600 mb-3">Vopari</h1>
      <p className="text-gray-500 text-lg mb-8 max-w-sm">
        Upload any grocery flyer and find the cheapest price for every item on
        your list.
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/register">Get started free</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
