import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";
import BottomNav from "@/components/bottom-nav";

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

  const email = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── TOP NAR — email + sign out always, links on md+ ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-emerald-600 shrink-0"
          >
            Vopari
          </Link>

          {/* Nav links — hidden on mobile, visible md+ */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:block text-sm text-gray-400 truncate max-w-40">
              {email}
            </span>
            <div className="lg:hidden w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
              {initials}
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      {/* pb-20 on mobile to clear the bottom nav */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* ── BOTTOM NAV — mobile only ── */}
      <BottomNav />
    </div>
  );
}
