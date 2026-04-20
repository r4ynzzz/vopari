import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Contact — Vopari",
  description: "Get in touch with the Vopari team.",
};

export default function ContactPage() {
  return (
    <>
      <div className="min-h-screen bg-[#f7f9f7]">
        {/* Nav */}
        <header className="sticky top-0 z-50 bg-[#f7f9f7]/90 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-serif text-xl text-emerald-700 tracking-tight"
            >
              Vopari
            </Link>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-500 text-sm"
            >
              <Link href="/">← Back to home</Link>
            </Button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">
              Contact
            </p>
            <h1 className="text-4xl font-serif text-slate-900 mb-4">
              Get in touch
            </h1>
            <p className="text-slate-500 text-base leading-relaxed">
              We are a small team building Vopari for South African shoppers. We
              read every message and respond within 2 business days.
            </p>
          </div>

          {/* Contact cards */}
          <div className="space-y-4 mb-12">
            <Card className="border-slate-100">
              <CardContent className="p-6 flex items-start gap-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  💬
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    General enquiries
                  </p>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                    Questions about the app, how it works, or anything else.
                  </p>
                  href="mailto:hello@vopari.app" className="text-sm
                  text-emerald-700 hover:underline font-medium"
                  <a>hello@vopari.app</a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100">
              <CardContent className="p-6 flex items-start gap-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  🔒
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    Privacy & data
                  </p>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                    POPIA rights requests, data deletion, or privacy concerns.
                  </p>
                  href="mailto:privacy@vopari.app" className="text-sm
                  text-emerald-700 hover:underline font-medium"
                  <a>privacy@vopari.app</a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100">
              <CardContent className="p-6 flex items-start gap-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  ⚖️
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">Legal</p>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                    Terms of service questions, legal notices, or compliance
                    matters.
                  </p>
                  href="mailto:legal@vopari.app" className="text-sm
                  text-emerald-700 hover:underline font-medium"
                  <a>legal@vopari.app</a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100">
              <CardContent className="p-6 flex items-start gap-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  🐛
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">Bug reports</p>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                    Found something broken? Tell us exactly what happened and we
                    will fix it fast.
                  </p>
                  href="mailto:bugs@vopari.app" className="text-sm
                  text-emerald-700 hover:underline font-medium"
                  <a>bugs@vopari.app</a>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="mb-10 bg-slate-100" />

          {/* Response time */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-10">
            <p className="font-medium text-emerald-800 mb-2">What to expect</p>
            <ul className="space-y-2 text-sm text-emerald-700">
              <li className="flex gap-2">
                <span className="shrink-0">–</span>
                <span>We respond to all emails within 2 business days</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">–</span>
                <span>
                  POPIA rights requests are handled within 30 days as required
                  by law
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">–</span>
                <span>
                  Bug reports go straight to the developer — no support ticket
                  queue
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">–</span>
                <span>
                  We are based in South Africa and work in SAST (UTC+2)
                </span>
              </li>
            </ul>
          </div>

          {/* Footer links */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-emerald-700 hover:underline">
              Privacy Policy →
            </Link>
            <Link href="/terms" className="text-emerald-700 hover:underline">
              Terms of Service →
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-700">
              Back to Vopari
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
