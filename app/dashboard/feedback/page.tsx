"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────

interface FormData {
  nps_score: number | null;
  ai_accuracy: number | null;
  stores_used: string[];
  shopping_frequency: string;
  biggest_frustration: string;
  feature_priority: string;
  willingness_to_pay: string;
  deal_sources: string[];
  ease_of_use: number | null;
  one_improvement: string;
}

// ─── Constants ────────────────────────────────────────

const SA_STORES = [
  "Checkers",
  "Pick n Pay",
  "Shoprite",
  "Woolworths",
  "Spar",
  "Game",
  "Makro",
  "Clicks",
  "Dis-Chem",
  "Other",
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "few_week", label: "A few times a week" },
  { value: "weekly", label: "Once a week" },
  { value: "fortnightly", label: "Every two weeks" },
  { value: "monthly", label: "Monthly" },
];

const FEATURES = [
  { value: "price_alerts", label: "Price drop alerts when items go on sale" },
  { value: "whatsapp", label: "Send flyers via WhatsApp directly" },
  { value: "shopping_route", label: "Optimal shopping route across stores" },
  { value: "history", label: "Price history and trends over time" },
  { value: "shared_lists", label: "Share lists with family members" },
  {
    value: "store_products",
    label: "Store product catalogues (no flyer needed)",
  },
];

const PAY_RANGES = [
  { value: "0", label: "R0 — I would not pay" },
  { value: "20", label: "R20/month" },
  { value: "39", label: "R39/month" },
  { value: "59", label: "R59/month" },
  { value: "79", label: "R79/month" },
  { value: "100+", label: "R100+ / month" },
];

const DEAL_SOURCES = [
  "WhatsApp groups",
  "Store apps",
  "Newspapers/flyers",
  "Word of mouth",
  "Social media",
  "Store visits",
];

// ─── Sub-components ───────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i < current
              ? "bg-emerald-600 flex-1"
              : i === current
                ? "bg-emerald-600 flex-2"
                : "bg-gray-200 flex-1"
          }`}
        />
      ))}
    </div>
  );
}

function NpsButton({
  value,
  selected,
  onClick,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  const color =
    value <= 6
      ? selected
        ? "bg-red-500 text-white border-red-500"
        : "border-red-200 text-red-400 hover:bg-red-50"
      : value <= 8
        ? selected
          ? "bg-amber-500 text-white border-amber-500"
          : "border-amber-200 text-amber-500 hover:bg-amber-50"
        : selected
          ? "bg-emerald-600 text-white border-emerald-600"
          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50";

  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 text-sm font-medium border rounded-lg transition-all duration-150 ${color}`}
    >
      {value}
    </button>
  );
}

function StarButton({
  value,
  selected,
  onClick,
  label,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-150 ${
        selected
          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
          : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
      }`}
    >
      <span className="text-xl">
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
      <span className="text-xs">{label}</span>
    </button>
  );
}

function MultiSelect({
  options,
  selected,
  onChange,
  max,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (!max || selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isDisabled = !isSelected && !!max && selected.length >= max;
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            disabled={isDisabled}
            className={`px-4 py-2 text-sm rounded-full border transition-all duration-150 ${
              isSelected
                ? "bg-emerald-600 text-white border-emerald-600"
                : isDisabled
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────

export default function FeedbackPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    nps_score: null,
    ai_accuracy: null,
    stores_used: [],
    shopping_frequency: "",
    biggest_frustration: "",
    feature_priority: "",
    willingness_to_pay: "",
    deal_sources: [],
    ease_of_use: null,
    one_improvement: "",
  });

  const update = (field: keyof FormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const TOTAL_STEPS = 5;

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.nps_score !== null;
      case 1:
        return form.ai_accuracy !== null && form.ease_of_use !== null;
      case 2:
        return form.stores_used.length > 0 && form.shopping_frequency !== "";
      case 3:
        return form.feature_priority !== "" && form.willingness_to_pay !== "";
      case 4:
        return true; // open text is optional
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Thank you for your feedback
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Every response genuinely shapes what we build next. Your input helps
          us make Vopari work better for South African shoppers.
        </p>
        <Button
          asChild
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
        >
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Badge
          variant="outline"
          className="text-emerald-700 border-emerald-200 bg-emerald-50 mb-4 text-xs"
        >
          Beta feedback · Takes 2 minutes
        </Badge>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Help us build a better Vopari
        </h1>
        <p className="text-sm text-gray-500">
          Step {step + 1} of {TOTAL_STEPS}
        </p>
      </div>

      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* ── STEP 0 — NPS ────────────────────────── */}
      {step === 0 && (
        <Card className="border-gray-100">
          <CardContent className="p-6 space-y-6">
            <div>
              <p className="font-medium text-gray-900 mb-1">
                How likely are you to recommend Vopari to a friend or family
                member?
              </p>
              <p className="text-sm text-gray-400 mb-5">
                0 = not at all likely · 10 = extremely likely
              </p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 11 }, (_, i) => (
                  <NpsButton
                    key={i}
                    value={i}
                    selected={form.nps_score === i}
                    onClick={() => update("nps_score", i)}
                  />
                ))}
              </div>
              {form.nps_score !== null && (
                <p className="text-xs text-gray-400 mt-3">
                  {form.nps_score <= 6
                    ? "We hear you — tell us more on the next screens."
                    : form.nps_score <= 8
                      ? "Thanks! What would make it a 10?"
                      : "That means a lot — thank you!"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 1 — ACCURACY + EASE ─────────────── */}
      {step === 1 && (
        <Card className="border-gray-100">
          <CardContent className="p-6 space-y-8">
            <div>
              <p className="font-medium text-gray-900 mb-1">
                How accurate was the AI at extracting prices from your flyers?
              </p>
              <p className="text-sm text-gray-400 mb-4">
                This is the most important thing we need to know right now.
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { v: 1, l: "Very poor" },
                  { v: 2, l: "Poor" },
                  { v: 3, l: "Okay" },
                  { v: 4, l: "Good" },
                  { v: 5, l: "Excellent" },
                ].map(({ v, l }) => (
                  <StarButton
                    key={v}
                    value={v}
                    selected={form.ai_accuracy === v}
                    onClick={() => update("ai_accuracy", v)}
                    label={l}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">
                How easy was Vopari to use overall?
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Were you able to figure things out without help?
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { v: 1, l: "Very hard" },
                  { v: 2, l: "Hard" },
                  { v: 3, l: "OK" },
                  { v: 4, l: "Easy" },
                  { v: 5, l: "Very easy" },
                ].map(({ v, l }) => (
                  <StarButton
                    key={v}
                    value={v}
                    selected={form.ease_of_use === v}
                    onClick={() => update("ease_of_use", v)}
                    label={l}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2 — STORES + FREQUENCY ─────────── */}
      {step === 2 && (
        <Card className="border-gray-100">
          <CardContent className="p-6 space-y-8">
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Which stores do you most often scan or compare?
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Select all that apply — this helps us prioritise store
                partnerships.
              </p>
              <MultiSelect
                options={SA_STORES}
                selected={form.stores_used}
                onChange={(v) => update("stores_used", v)}
              />
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-4">
                How often do you go grocery shopping?
              </p>
              <div className="space-y-2">
                {FREQUENCIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update("shopping_frequency", value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                      form.shopping_frequency === value
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3 — FEATURES + WILLINGNESS TO PAY ── */}
      {step === 3 && (
        <Card className="border-gray-100">
          <CardContent className="p-6 space-y-8">
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Which feature would make Vopari most useful for you?
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Pick the one you want most — this directly shapes our roadmap.
              </p>
              <div className="space-y-2">
                {FEATURES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update("feature_priority", value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                      form.feature_priority === value
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">
                How much would you pay for Vopari per month?
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Be honest — this helps us price fairly for South African
                shoppers.
              </p>
              <div className="space-y-2">
                {PAY_RANGES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update("willingness_to_pay", value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                      form.willingness_to_pay === value
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 4 — OPEN TEXT ───────────────────── */}
      {step === 4 && (
        <Card className="border-gray-100">
          <CardContent className="p-6 space-y-6">
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Where do you currently find out about grocery deals?
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Select all that apply
              </p>
              <MultiSelect
                options={DEAL_SOURCES}
                selected={form.deal_sources}
                onChange={(v) => update("deal_sources", v)}
              />
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">
                What is your biggest frustration with Vopari right now?
              </p>
              <p className="text-sm text-gray-400 mb-3">
                Be as specific as possible — this is the most useful feedback
                you can give us.
              </p>
              <Textarea
                placeholder="e.g. The matching was wrong for chicken prices, or it couldn't read the Shoprite flyer clearly..."
                value={form.biggest_frustration}
                onChange={(e) => update("biggest_frustration", e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">
                If you could change one thing, what would it be?
              </p>
              <p className="text-sm text-gray-400 mb-3">
                Optional — but these are the answers we read first.
              </p>
              <Textarea
                placeholder="e.g. Make it easier to add items to my list, or let me scan with my camera..."
                value={form.one_improvement}
                onChange={(e) => update("one_improvement", e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {step > 0 ? (
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            className="text-gray-500"
          >
            ← Back
          </Button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
          >
            Continue →
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
          >
            {submitting ? "Submitting..." : "Submit feedback"}
          </Button>
        )}
      </div>

      {/* Skip link */}
      <p className="text-center text-xs text-gray-400 mt-4">
        <Link
          href="/dashboard"
          className="hover:text-gray-600 transition-colors"
        >
          Skip for now
        </Link>
      </p>
    </div>
  );
}
