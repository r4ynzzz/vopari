import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";

const navLinks = [
  { href: "/dashboard", label: "Lists" },
  { href: "/dashboard/upload", label: "Upload" },
  { href: "/dashboard/results", label: "Results" },
  { href: "/dashboard/documents", label: "Flyers" },
  { href: "/dashboard/feedback", label: "Feedback" },
];

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

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-emerald-600 mr-4">
              Vopari
            </span>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block truncate max-w-45">
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
