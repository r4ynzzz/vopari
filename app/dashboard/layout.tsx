import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-emerald-600">
              Vopari
            </span>
            <div className="flex gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors"
              >
                Lists
              </Link>
              <Link
                href="/dashboard/upload"
                className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors"
              >
                Upload
              </Link>
              <Link
                href="/dashboard/results"
                className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors"
              >
                Results
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
