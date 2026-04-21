import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Lists", icon: "📋" },
  { href: "/dashboard/upload", label: "Upload", icon: "📤" },
  { href: "/dashboard/results", label: "Results", icon: "💰" },
  { href: "/dashboard/documents", label: "Flyers", icon: "📄" },
  { href: "/dashboard/feedback", label: "Feedback", icon: "✦" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2">
      <div className="grid grid-cols-5 gap-1 max-w-5xl mx-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-gray-50 hover:bg-emerald-50 active:bg-emerald-100 active:scale-95 transition-all text-gray-500 hover:text-emerald-700"
          >
            <span className="text-xl leading-none">{link.icon}</span>
            <span className="text-[10px] font-medium leading-none">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
