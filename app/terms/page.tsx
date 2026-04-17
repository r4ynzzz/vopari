import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const LAST_UPDATED = "17 April 2026";
const EFFECTIVE_DATE = "17 April 2026";
const CONTACT_EMAIL = "legal@vopari.app";
const APP_URL = "https://vopari.app";

export const metadata = {
  title: "Terms of Service — Vopari",
  description:
    "The terms governing your use of the Vopari price comparison service.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-emerald-500 mt-0.5 shrink-0">–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const TOC = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "description", label: "Service description" },
  { id: "eligibility", label: "Eligibility" },
  { id: "account", label: "Your account" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "uploaded-content", label: "Uploaded content" },
  { id: "ai-disclaimer", label: "AI accuracy disclaimer" },
  { id: "pricing", label: "Pricing and payments" },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "limitation", label: "Limitation of liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
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

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[240px_1fr] gap-16">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">
                Contents
              </p>
              <nav className="space-y-1">
                {TOC.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block text-sm text-slate-500 hover:text-emerald-700 py-1 transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <Separator className="my-6 bg-slate-100" />

              <div className="space-y-2">
                <p className="text-xs text-slate-400">Last updated</p>
                <p className="text-xs font-medium text-slate-600">
                  {LAST_UPDATED}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-400">Also read</p>
                <Link
                  href="/privacy"
                  className="text-xs text-emerald-700 hover:underline block"
                >
                  Privacy Policy →
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main>
            {/* Header */}
            <div className="mb-12">
              <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">
                Legal
              </p>
              <h1 className="text-4xl font-serif text-slate-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-sm text-slate-400">
                Effective {EFFECTIVE_DATE} · Last updated {LAST_UPDATED}
              </p>
              <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">
                  Plain English summary:
                </strong>{" "}
                Use Vopari for lawful personal grocery shopping purposes. Do not
                abuse or overload the service. AI price extraction is helpful
                but not always perfect — always verify prices before making
                purchasing decisions. We may change or discontinue the service
                with notice.
              </div>
            </div>

            <Section id="acceptance" title="1. Acceptance of terms">
              <P>
                By creating an account or using the Vopari service available at{" "}
                {APP_URL} (the "Service"), you agree to be bound by these Terms
                of Service ("Terms"). If you do not agree to these Terms, do not
                use the Service.
              </P>
              <P>
                These Terms constitute a legally binding agreement between you
                and the operator of Vopari. Please read them carefully. By using
                the Service, you confirm that you have read, understood and
                agree to be bound by these Terms and our Privacy Policy.
              </P>
            </Section>

            <Section id="description" title="2. Service description">
              <P>
                Vopari is a grocery price comparison platform that allows users
                to:
              </P>
              <Ul
                items={[
                  "Create and manage personal grocery shopping lists",
                  "Upload images and PDF documents of grocery store flyers and catalogues",
                  "Use artificial intelligence to automatically extract product names and prices from uploaded documents",
                  "Compare extracted prices against items on their grocery lists to identify the cheapest options across stores",
                ]}
              />
              <P>
                The Service uses third-party AI models (Google Gemini and
                Anthropic Claude) to process uploaded documents. Price data is
                extracted automatically and may not always be accurate. See
                Section 7 (AI Accuracy Disclaimer) for important limitations.
              </P>
              <P>
                Vopari is provided as a convenience tool for personal shopping
                decisions. We are not affiliated with, endorsed by, or in
                partnership with any of the retailers whose flyers may be
                uploaded to the platform.
              </P>
            </Section>

            <Section id="eligibility" title="3. Eligibility">
              <P>
                You must be at least 18 years old to use the Service. By using
                Vopari, you represent and warrant that you are 18 years of age
                or older and have the legal capacity to enter into these Terms.
              </P>
              <P>
                If you are under 18, you may only use the Service with the
                involvement and consent of a parent or legal guardian who agrees
                to these Terms on your behalf.
              </P>
            </Section>

            <Section id="account" title="4. Your account">
              <P>
                To use most features of the Service, you must create an account
                using a valid email address or a Google account. You are
                responsible for:
              </P>
              <Ul
                items={[
                  "Maintaining the confidentiality of your account credentials",
                  "All activity that occurs under your account",
                  "Ensuring the information you provide during registration is accurate and up to date",
                  "Notifying us immediately at legal@vopari.app if you suspect unauthorised access to your account",
                ]}
              />
              <P>
                You may not create more than one account per person or share
                your account with others. We reserve the right to terminate
                accounts that we believe are being shared or used in violation
                of these Terms.
              </P>
            </Section>

            <Section id="acceptable-use" title="5. Acceptable use">
              <P>
                You agree to use the Service only for lawful purposes and in
                accordance with these Terms. You must not:
              </P>
              <Ul
                items={[
                  "Use the Service for any commercial purpose, including reselling price data or building competing services, without our prior written consent",
                  "Upload documents that you do not have the right to upload, including materials that infringe third-party intellectual property rights",
                  "Upload documents containing personal information of other individuals without their consent",
                  "Attempt to reverse engineer, decompile or extract the source code of the Service",
                  "Use automated scripts, bots or scraping tools to access or extract data from the Service",
                  "Intentionally overload or disrupt the Service or its infrastructure",
                  "Attempt to bypass, circumvent or disable any security features or rate limits",
                  "Use the Service in a way that could damage the reputation of Vopari or the third-party services we use",
                  "Upload unlawful content including material that is defamatory, obscene or promotes illegal activity",
                  "Impersonate any person or entity or misrepresent your affiliation with any person or entity",
                ]}
              />
              <P>
                Violation of these acceptable use rules may result in immediate
                suspension or termination of your account.
              </P>
            </Section>

            <Section id="uploaded-content" title="6. Uploaded content">
              <P>
                When you upload documents to Vopari, you retain any intellectual
                property rights you hold in that content. By uploading, you
                grant us a limited, non-exclusive, royalty-free licence to
                process, store and display that content solely for the purpose
                of providing the Service to you.
              </P>
              <P>You represent and warrant that:</P>
              <Ul
                items={[
                  "You have the right to upload the content you submit",
                  "The content does not violate the intellectual property rights of any third party",
                  "The content does not violate any applicable law",
                ]}
              />
              <P>
                Grocery store flyers and catalogues are generally publicly
                distributed marketing materials. Uploading them for personal
                price comparison purposes is consistent with their intended use.
                However, systematic extraction or redistribution of retailer
                price data for commercial purposes may require separate
                authorisation from the relevant retailer.
              </P>
              <P>
                We reserve the right to remove any content that we determine, in
                our sole discretion, violates these Terms or applicable law.
              </P>
            </Section>

            <Section id="ai-disclaimer" title="7. AI accuracy disclaimer">
              <P>This section is important. Please read it carefully.</P>
              <P>
                Vopari uses artificial intelligence to extract product names,
                prices and other information from documents you upload.
                AI-extracted data is provided for convenience and informational
                purposes only.
              </P>
              <P>
                <strong className="text-slate-800">
                  AI extraction is not perfect.
                </strong>{" "}
                Extracted prices may be:
              </P>
              <Ul
                items={[
                  "Incorrect due to image quality, unusual formatting or complex layouts",
                  "Out of date if a flyer's validity period has expired",
                  "Incomplete if not all items in a document were successfully extracted",
                  "Mismatched to the wrong product when similar items appear near each other",
                  "Subject to conditions, exclusions or promotional terms not captured in the extraction",
                ]}
              />
              <P>
                <strong className="text-slate-800">
                  Always verify prices in-store before making a purchasing
                  decision.
                </strong>{" "}
                Vopari accepts no liability for any losses, inconvenience or
                disappointment arising from reliance on AI-extracted price data.
                Actual prices at the point of sale are determined by the
                retailer and may differ from what is shown on the Service.
              </P>
              <P>
                Pricing and promotional data displayed on Vopari is not
                endorsed, verified or provided by any retailer. The retailers
                listed on the platform have no relationship with Vopari and have
                not authorised the use of their branding or pricing data.
              </P>
            </Section>

            <Section id="pricing" title="8. Pricing and payments">
              <P>
                Vopari is currently available at no charge during its beta
                period. We reserve the right to introduce paid subscription
                plans and usage-based charges in the future.
              </P>
              <P>When paid tiers are introduced:</P>
              <Ul
                items={[
                  "We will notify existing users at least 30 days before any free tier limitations take effect",
                  "Subscription fees will be charged in South African Rand (ZAR) through a compliant payment provider",
                  "Subscriptions will renew automatically unless cancelled before the renewal date",
                  "Refunds will be considered on a case-by-case basis at our discretion",
                  "We reserve the right to change pricing with 30 days notice to existing subscribers",
                ]}
              />
              <P>
                All prices displayed on the Service will include VAT where
                applicable under South African law.
              </P>
            </Section>

            <Section
              id="intellectual-property"
              title="9. Intellectual property"
            >
              <P>
                The Vopari name, logo, product design, software, and all content
                created by us (excluding content you upload) are owned by or
                licensed to Vopari and are protected by copyright, trademark and
                other intellectual property laws.
              </P>
              <P>
                You are granted a limited, non-exclusive, non-transferable,
                revocable licence to use the Service for personal,
                non-commercial purposes in accordance with these Terms. This
                licence does not include the right to:
              </P>
              <Ul
                items={[
                  "Copy, modify or distribute the Vopari software or codebase",
                  "Use the Vopari name, logo or branding without prior written consent",
                  "Create derivative works based on the Service",
                  "Extract or scrape data from the Service for use outside of the normal application interface",
                ]}
              />
            </Section>

            <Section id="disclaimers" title="10. Disclaimers">
              <P>
                The Service is provided "as is" and "as available" without
                warranties of any kind, either express or implied, including but
                not limited to:
              </P>
              <Ul
                items={[
                  "Warranties of merchantability or fitness for a particular purpose",
                  "Warranties that the Service will be uninterrupted, error-free or free from viruses",
                  "Warranties as to the accuracy, reliability or completeness of any information provided",
                  "Warranties that any defects will be corrected",
                ]}
              />
              <P>
                Vopari is a price comparison tool only. We do not guarantee that
                prices shown are available, current, or accurate. We are not
                responsible for the content of retailer documents uploaded by
                users.
              </P>
              <P>
                We do not guarantee continuous availability of the Service. We
                may suspend or discontinue the Service at any time for
                maintenance, upgrades or other operational reasons, and will
                make reasonable efforts to notify users of planned downtime.
              </P>
            </Section>

            <Section id="limitation" title="11. Limitation of liability">
              <P>
                To the maximum extent permitted by South African law, Vopari and
                its operators shall not be liable for any indirect, incidental,
                special, consequential or punitive damages arising from:
              </P>
              <Ul
                items={[
                  "Your use of or inability to use the Service",
                  "Reliance on AI-extracted price data that is inaccurate or outdated",
                  "Unauthorised access to or alteration of your data",
                  "Any other matter relating to the Service",
                ]}
              />
              <P>
                Our total liability to you for any claim arising from or
                relating to these Terms or the Service shall not exceed the
                amount you paid us in the 12 months preceding the event giving
                rise to the claim. During the free beta period, our total
                liability is limited to ZAR 500.
              </P>
              <P>
                Nothing in these Terms limits liability for death or personal
                injury caused by negligence, fraud or fraudulent
                misrepresentation, or any other liability that cannot be
                excluded under South African law.
              </P>
            </Section>

            <Section id="termination" title="12. Termination">
              <P>
                You may terminate your account at any time by deleting your
                account from within the Service. Upon termination, your data
                will be deleted in accordance with our Privacy Policy.
              </P>
              <P>We may suspend or terminate your account at any time if:</P>
              <Ul
                items={[
                  "You violate these Terms",
                  "We are required to do so by law",
                  "We discontinue the Service",
                  "Your account has been inactive for more than 12 months",
                ]}
              />
              <P>
                Where possible, we will provide 14 days notice before
                terminating an account, unless the termination is due to a
                serious violation of these Terms, a legal obligation, or a
                security concern.
              </P>
              <P>
                Upon termination, your right to use the Service immediately
                ceases. Sections 9, 10, 11 and 13 of these Terms survive
                termination.
              </P>
            </Section>

            <Section id="governing-law" title="13. Governing law">
              <P>
                These Terms are governed by and construed in accordance with the
                laws of the Republic of South Africa, without regard to its
                conflict of law provisions.
              </P>
              <P>
                Any dispute arising out of or relating to these Terms or your
                use of the Service shall be subject to the exclusive
                jurisdiction of the courts of South Africa. We encourage you to
                contact us first at {CONTACT_EMAIL} to attempt to resolve any
                dispute informally before initiating formal proceedings.
              </P>
            </Section>

            <Section id="changes" title="14. Changes to terms">
              <P>
                We reserve the right to modify these Terms at any time. When we
                make material changes, we will notify you by displaying a notice
                within the app at least 14 days before the changes take effect,
                and by updating the "Last updated" date at the top of this page.
              </P>
              <P>
                Your continued use of the Service after changes become effective
                constitutes your acceptance of the revised Terms. If you do not
                agree to the revised Terms, you must stop using the Service and
                delete your account.
              </P>
            </Section>

            <Section id="contact" title="15. Contact">
              <P>
                If you have questions about these Terms or need to contact us
                for any legal matter, please reach out:
              </P>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2 not-prose">
                <p className="text-sm font-medium text-slate-800">
                  Vopari Legal
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="text-sm text-slate-400">
                  We aim to respond within 5 business days.
                </p>
              </div>
            </Section>

            {/* Footer nav */}
            <Separator className="mb-8 bg-slate-100" />
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-emerald-700 hover:underline"
              >
                Privacy Policy →
              </Link>
              <Link href="/" className="text-slate-500 hover:text-slate-700">
                Back to Vopari
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
