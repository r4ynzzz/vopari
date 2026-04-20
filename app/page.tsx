import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  // Redirect signed-in users straight to dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#f7f9f7] font-sans">
      {/* ── CUSTOM STYLES ────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        .font-display { font-family: 'Instrument Serif', serif; }
        .font-body    { font-family: 'Geist', sans-serif; }

        .grain::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 999;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes pricePop {
          0%   { opacity: 0; transform: scale(0.85) translateY(6px); }
          60%  { transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .animate-fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-fade-in { animation: fadeIn 0.6s ease both; }
        .animate-float   { animation: float 4s ease-in-out infinite; }
        .animate-ticker  { animation: ticker 28s linear infinite; }
        .animate-price-pop { animation: pricePop 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }

        .delay-100 { animation-delay: 0.10s; }
        .delay-200 { animation-delay: 0.20s; }
        .delay-300 { animation-delay: 0.30s; }
        .delay-400 { animation-delay: 0.40s; }
        .delay-500 { animation-delay: 0.50s; }
        .delay-600 { animation-delay: 0.60s; }
        .delay-700 { animation-delay: 0.70s; }
        .delay-800 { animation-delay: 0.80s; }
        .delay-900 { animation-delay: 0.90s; }

        .card-hover {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.08);
        }

        .price-strike {
          position: relative;
          color: #9ca3af;
        }
        .price-strike::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1.5px;
          background: #ef4444;
          transform: translateY(-50%);
        }

        .scanline-container {
          position: relative;
          overflow: hidden;
        }
        .scanline-container::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(transparent, rgba(29,158,117,0.06), transparent);
          animation: scanline 2.5s ease-in-out infinite;
          pointer-events: none;
        }

        .ticker-wrap {
          overflow: hidden;
          border-top: 1px solid #e2e8e4;
          border-bottom: 1px solid #e2e8e4;
          background: white;
        }
        .ticker-track {
          display: flex;
          width: max-content;
          white-space: nowrap;
        }

        .hero-glow {
          position: absolute;
          top: -120px;
          right: -80px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .step-connector {
          position: absolute;
          top: 28px;
          left: calc(50% + 32px);
          right: calc(-50% + 32px);
          height: 1px;
          background: repeating-linear-gradient(
            90deg,
            #d1fae5 0px,
            #d1fae5 6px,
            transparent 6px,
            transparent 14px
          );
        }
      `}</style>

      <div className="grain" />

      {/* ── NAV ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#f7f9f7]/90 backdrop-blur-xl border-b border-[#e2e8e4]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-2xl text-emerald-700 tracking-tight">
            Vopari
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {["How it works", "Features"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="font-body text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="font-body text-slate-600"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="font-body bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-5"
            >
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 overflow-hidden">
        <div className="hero-glow" />

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="animate-fade-up">
              <Badge
                variant="outline"
                className="font-body text-xs text-emerald-700 border-emerald-200 bg-emerald-50 mb-6 px-3 py-1.5 rounded-full"
              >
                <span className="pulse-dot inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                Saving South Africans money daily
              </Badge>
            </div>

            <h1 className="font-display text-[clamp(44px,6vw,72px)] leading-[1.02] text-slate-900 mb-6 animate-fade-up delay-100">
              Stop guessing.
              <br />
              <em className="text-emerald-700 not-italic">Find the cheapest</em>
              <br />
              grocery prices.
            </h1>

            <p className="font-body text-lg text-slate-500 leading-relaxed max-w-lg mb-8 font-light animate-fade-up delay-200">
              Upload any flyer — Checkers, Pick n Pay, Shoprite, Woolworths. Our
              AI extracts every price instantly and finds the cheapest option
              for every item on your list.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-up delay-300">
              <Button
                asChild
                size="lg"
                className="font-body bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-8 h-12 text-base"
              >
                <Link href="/register">Get started free →</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="font-body text-slate-600 h-12 text-base"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-8 animate-fade-up delay-400">
              <div className="flex -space-x-2">
                {[
                  { initials: "TM", bg: "bg-emerald-600" },
                  { initials: "NZ", bg: "bg-teal-500" },
                  { initials: "KB", bg: "bg-emerald-800" },
                  { initials: "RL", bg: "bg-emerald-400" },
                ].map(({ initials, bg }) => (
                  <div
                    key={initials}
                    className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-[10px] font-semibold font-body`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="font-body text-sm text-slate-500">
                <span className="font-medium text-slate-700">2 400+</span>{" "}
                shoppers saving money this week
              </p>
            </div>
          </div>

          {/* Right — App Mockup */}
          <div className="relative animate-fade-up delay-300">
            <div className="animate-float">
              <Card className="rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden bg-white max-w-sm mx-auto">
                {/* App header bar */}
                <div className="bg-emerald-700 px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-white text-lg">
                      Vopari
                    </span>
                    <span className="font-body text-emerald-200 text-xs">
                      Week 15 specials
                    </span>
                  </div>
                  <p className="font-body text-emerald-100/70 text-xs">
                    Comparing 3 stores · 8 items
                  </p>
                </div>

                <CardContent className="p-4 scanline-container">
                  <p className="font-body text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-3">
                    Cheapest options found
                  </p>

                  {/* Result rows */}
                  {[
                    {
                      name: "Full Cream Milk 2L",
                      store: "Checkers",
                      price: "R29.99",
                      old: "R34.99",
                      best: true,
                      delay: "delay-400",
                    },
                    {
                      name: "White Bread 700g",
                      store: "Pick n Pay",
                      price: "R18.99",
                      old: "R22.99",
                      best: true,
                      delay: "delay-500",
                    },
                    {
                      name: "Free Range Eggs 6pk",
                      store: "Shoprite",
                      price: "R34.99",
                      old: "R39.99",
                      best: true,
                      delay: "delay-600",
                    },
                    {
                      name: "Sunflower Oil 2L",
                      store: "Woolworths",
                      price: "R72.99",
                      old: "R84.99",
                      best: false,
                      delay: "delay-700",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl mb-1.5 animate-price-pop ${item.delay} ${
                        item.best
                          ? "bg-emerald-50 border border-emerald-100"
                          : "bg-slate-50 border border-slate-100"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-xs font-medium text-slate-800 truncate">
                          {item.name}
                        </p>
                        <p className="font-body text-[10px] text-slate-400 mt-0.5">
                          {item.store}
                        </p>
                      </div>
                      <div className="flex flex-col items-end ml-3 shrink-0">
                        <span className="font-display text-sm text-emerald-700 font-normal">
                          {item.price}
                        </span>
                        <span className="price-strike font-body text-[10px]">
                          {item.old}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Total saving strip */}
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between animate-price-pop delay-800">
                    <div>
                      <p className="font-body text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                        You save
                      </p>
                      <p className="font-body text-[10px] text-amber-500 mt-0.5">
                        vs highest prices
                      </p>
                    </div>
                    <span className="font-display text-xl text-amber-700">
                      R23.97
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Floating stat cards */}
            <Card className="absolute -left-6 top-1/3 rounded-xl shadow-lg border-slate-100 bg-white p-3 animate-price-pop delay-900">
              <p className="font-body text-[10px] text-slate-400">
                Parse accuracy
              </p>
              <p className="font-display text-2xl text-emerald-700">97%</p>
            </Card>
            <Card className="absolute -right-4 bottom-16 rounded-xl shadow-lg border-slate-100 bg-white p-3 animate-price-pop delay-900">
              <p className="font-body text-[10px] text-slate-400">
                Avg. monthly saving
              </p>
              <p className="font-display text-2xl text-emerald-700">R340</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────── 
      <div className="ticker-wrap py-3">
        <div className="ticker-track animate-ticker">
          {[...Array(2)].map((_, i) => (
            <span key={`group-${i}`} className="inline-flex items-center">
              {[
                "Checkers",
                "Pick n Pay",
                "Shoprite",
                "Woolworths",
                "Spar",
                "Game",
                "Makro",
                "Clicks",
              ].map((store, j) => (
                <span
                  key={`${i}-${j}-${store}`}
                  className="font-body text-xs font-medium text-slate-400 mx-8 tracking-widest uppercase"
                >
                  {store}
                  <span className="mx-8 text-emerald-200">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
*/}

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section id="how-it-works" className="py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">
            How it works
          </p>
          <h2 className="font-display text-[clamp(32px,4vw,52px)] text-slate-900 leading-tight">
            Three steps to cheaper groceries
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {[
            {
              step: "01",
              icon: "📋",
              title: "Build your grocery list",
              body: "Add the items you need each week. Milk, bread, eggs, chicken — whatever your household uses.",
            },
            {
              step: "02",
              icon: "📄",
              title: "Upload any flyer",
              body: "Drag and drop a photo or PDF of any store's weekly specials. Our AI extracts every item and price in seconds.",
            },
            {
              step: "03",
              icon: "✓",
              title: "See the cheapest prices",
              body: "Get a clear comparison showing where to buy each item for the least money, across all your uploaded flyers.",
            },
          ].map(({ step, icon, title, body }, i) => (
            <Card
              key={step}
              className="relative rounded-2xl border-slate-100 bg-white p-8 card-hover"
            >
              {i < 2 && <div className="step-connector hidden md:block" />}
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-5">
                {icon}
              </div>
              <p className="font-body text-[10px] font-semibold tracking-widest text-slate-300 uppercase mb-2">
                Step {step}
              </p>
              <h3 className="font-display text-xl text-slate-900 mb-3">
                {title}
              </h3>
              <p className="font-body text-sm text-slate-500 leading-relaxed font-light">
                {body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section id="features" className="py-28 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-body text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">
              Features
            </p>
            <h2 className="font-display text-[clamp(32px,4vw,52px)] text-white leading-tight">
              Built for SA shoppers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "🤖",
                title: "AI price extraction",
                body: "Gemini reads every item off every flyer — messy layouts, multiple languages, any format. No manual entry.",
                accent: "bg-emerald-900/40 border-emerald-700/30",
              },
              {
                icon: "⚡",
                title: "Instant cache",
                body: "Same flyer uploaded twice? Loads instantly at zero cost. The more users share flyers, the faster everyone benefits.",
                accent: "bg-slate-800 border-slate-700",
              },
              {
                icon: "🔍",
                title: "Semantic matching",
                body: '"Milk" matches "Clover Full Cream 2L". Our AI understands products, not just strings.',
                accent: "bg-slate-800 border-slate-700",
              },
              {
                icon: "📊",
                title: "Multi-store compare",
                body: "Upload specials from 5 different stores and see exactly where each item is cheapest, side by side.",
                accent: "bg-slate-800 border-slate-700",
              },
              {
                icon: "📅",
                title: "Auto-expiry",
                body: "Flyers expire automatically based on their validity dates. No stale prices cluttering your results.",
                accent: "bg-slate-800 border-slate-700",
              },
              {
                icon: "🔒",
                title: "Private & secure",
                body: "Your lists and uploads are yours only. Row-level security ensures no one else sees your data.",
                accent: "bg-emerald-900/40 border-emerald-700/30",
              },
            ].map(({ icon, title, body, accent }) => (
              <Card
                key={title}
                className={`rounded-2xl border p-7 card-hover ${accent}`}
                style={{ background: "transparent" }}
              >
                <CardContent className="p-0">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-display text-lg text-white mb-2">
                    {title}
                  </h3>
                  <p className="font-body text-sm text-slate-400 leading-relaxed font-light">
                    {body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────── 
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="font-body text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">
            What shoppers say
          </p>
          <h2 className="font-display text-[clamp(28px,3.5vw,44px)] text-slate-900">
            Real savings, real people
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              quote:
                "I uploaded three flyers on Sunday and Vopari showed me exactly which store had the cheapest items. Saved R280 on my weekly shop.",
              name: "Thandi M.",
              location: "Soweto, JHB",
              saving: "R280 saved",
              initials: "TM",
              bg: "bg-emerald-600",
            },
            {
              quote:
                "The AI read a blurry Shoprite pamphlet my mom sent on WhatsApp and extracted 40+ items perfectly. I was genuinely shocked.",
              name: "Ntombi Z.",
              location: "Cape Town",
              saving: "R190 saved",
              initials: "NZ",
              bg: "bg-teal-600",
            },
            {
              quote:
                "As someone feeding a family of 6, every rand counts. Vopari has become part of my Sunday routine. Game changer.",
              name: "Kabelo B.",
              location: "Pretoria",
              saving: "R440 saved",
              initials: "KB",
              bg: "bg-emerald-800",
            },
          ].map(({ quote, name, location, saving, initials, bg }) => (
            <Card
              key={name}
              className="rounded-2xl border-slate-100 bg-white p-7 card-hover"
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="font-body text-sm text-slate-600 leading-relaxed font-light italic mb-6">
                  &ldquo;{quote}&rdquo;
                </p>
                <Separator className="mb-4 bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold font-body`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-slate-800">
                        {name}
                      </p>
                      <p className="font-body text-xs text-slate-400">
                        {location}
                      </p>
                    </div>
                  </div>
                  <Badge className="font-body text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100 rounded-full">
                    {saving}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      */}

      {/* ── PRICING ───────────────────────────────────── 
      <section id="pricing" className="py-28 bg-[#f0f7f3]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-body text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">
              Pricing
            </p>
            <h2 className="font-display text-[clamp(32px,4vw,52px)] text-slate-900 leading-tight mb-4">
              Simple, honest pricing
            </h2>
            <p className="font-body text-slate-500 font-light max-w-md mx-auto">
              Start free. Upgrade only when you need more. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {/* Free *
            <Card className="rounded-2xl border-slate-200 bg-white p-8">
              <CardContent className="p-0">
                <p className="font-body text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">
                  Explorer
                </p>
                <div className="mb-1">
                  <span className="font-display text-5xl text-slate-900">
                    R0
                  </span>
                </div>
                <p className="font-body text-sm text-slate-400 mb-7 pb-7 border-b border-slate-100">
                  Free forever
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "3 document parses/month",
                    "2 grocery lists",
                    "10 items per list",
                    "Basic matching",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                        ✓
                      </span>
                      <span className="font-body text-sm text-slate-600 font-light">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full rounded-full font-body border-slate-200 text-slate-700 hover:bg-slate-50"
                  asChild
                >
                  <Link href="/register">Get started</Link>
                </Button>
              </CardContent>
            </Card>

             Saver — featured 
            <Card className="rounded-2xl border-0 bg-emerald-700 p-8 relative shadow-2xl shadow-emerald-200 md:-mt-4 md:mb-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="font-body text-[10px] bg-amber-400 text-amber-900 border-0 rounded-full px-3 py-1 shadow-sm">
                  Most popular
                </Badge>
              </div>
              <CardContent className="p-0">
                <p className="font-body text-xs font-semibold tracking-widest text-emerald-200 uppercase mb-3">
                  Saver
                </p>
                <div className="mb-1">
                  <span className="font-display text-5xl text-white">R39</span>
                </div>
                <p className="font-body text-sm text-emerald-200/60 mb-7 pb-7 border-b border-white/10">
                  per month
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "20 document parses/month",
                    "Unlimited lists",
                    "Unlimited items",
                    "AI semantic matching",
                    "Price alerts",
                    "30-day history",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-white/15 flex items-center justify-center text-white text-[10px] shrink-0">
                        ✓
                      </span>
                      <span className="font-body text-sm text-emerald-100 font-light">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-full font-body bg-white text-emerald-700 hover:bg-emerald-50 font-medium"
                  asChild
                >
                  <Link href="/register">Start saving</Link>
                </Button>
              </CardContent>
            </Card>

             Power 
            <Card className="rounded-2xl border-slate-200 bg-white p-8">
              <CardContent className="p-0">
                <p className="font-body text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">
                  Power
                </p>
                <div className="mb-1">
                  <span className="font-display text-5xl text-slate-900">
                    R79
                  </span>
                </div>
                <p className="font-body text-sm text-slate-400 mb-7 pb-7 border-b border-slate-100">
                  per month
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "60 document parses/month",
                    "Everything in Saver",
                    "90-day history",
                    "Export to CSV",
                    "Multi-page PDFs",
                    "3 shared list members",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-[10px] shrink-0">
                        ✓
                      </span>
                      <span className="font-body text-sm text-slate-600 font-light">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full rounded-full font-body border-slate-200 text-slate-700 hover:bg-slate-50"
                  asChild
                >
                  <Link href="/register">Get started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="font-body text-xs text-center text-slate-400 mt-8">
            Need more? Credit packs available — 5 parses for R10, never expire.
          </p>
        </div>
      </section>
      */}
      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-32 max-w-4xl mx-auto px-6 text-center">
        <p className="font-body text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-6">
          Ready to save?
        </p>
        <h2 className="font-display text-[clamp(36px,5vw,64px)] text-slate-900 leading-tight mb-6">
          Upload your first flyer.
          <br />
          <span className="text-emerald-700">It takes 30 seconds.</span>
        </h2>
        <p className="font-body text-lg text-slate-500 font-light max-w-md mx-auto mb-10">
          No credit card required. Start with 3 free parses and see exactly how
          much you could be saving every week.
        </p>
        <Button
          asChild
          size="lg"
          className="font-body bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-10 h-14 text-base font-medium shadow-lg shadow-emerald-200"
        >
          <Link href="/register">Create free account →</Link>
        </Button>
        <p className="font-body text-xs text-slate-400 mt-4">
          Free forever · No credit card · Cancel anytime
        </p>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-display text-xl text-emerald-700">Vopari</span>
          <nav className="flex flex-wrap justify-center gap-6">
            <a
              href="/privacy"
              className="font-body text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="font-body text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              className="font-body text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              Contact
            </a>
          </nav>
          <p className="font-body text-xs text-slate-400">
            © {new Date().getFullYear()} Vopari. Made in South Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}
