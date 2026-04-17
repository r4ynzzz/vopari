import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const LAST_UPDATED = "17 April 2026";
const EFFECTIVE_DATE = "17 April 2026";
const CONTACT_EMAIL = "privacy@vopari.app";
const COMPANY_NAME = "Vopari";
const APP_URL = "https://vopari.app";

export const metadata = {
  title: "Privacy Policy — Vopari",
  description:
    "How Vopari collects, uses and protects your personal information.",
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
  { id: "who-we-are", label: "Who we are" },
  { id: "information-collected", label: "Information we collect" },
  { id: "how-we-use", label: "How we use your information" },
  { id: "ai-processing", label: "AI processing of your documents" },
  { id: "data-sharing", label: "Data sharing" },
  { id: "data-storage", label: "Data storage and security" },
  { id: "retention", label: "Data retention" },
  { id: "your-rights", label: "Your rights (POPIA)" },
  { id: "cookies", label: "Cookies" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPage() {
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
                  href="/terms"
                  className="text-xs text-emerald-700 hover:underline block"
                >
                  Terms of Service →
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
                Privacy Policy
              </h1>
              <p className="text-sm text-slate-400">
                Effective {EFFECTIVE_DATE} · Last updated {LAST_UPDATED}
              </p>
              <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">
                  Plain English summary:
                </strong>{" "}
                We collect only what we need to run the app. We do not sell your
                data. Your uploaded flyers are processed by AI to extract prices
                and then stored securely. You can delete your data at any time.
                We comply with South Africa's Protection of Personal Information
                Act (POPIA).
              </div>
            </div>

            <Section id="who-we-are" title="1. Who we are">
              <P>
                Vopari is a South African grocery price comparison service
                operated at {APP_URL}. When this policy refers to "Vopari",
                "we", "us" or "our", it means the operator of the Vopari
                platform.
              </P>
              <P>
                For purposes of POPIA, Vopari is the responsible party in
                respect of personal information collected through this service.
              </P>
              <P>
                If you have any questions about this policy or how we handle
                your personal information, contact us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald-700 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </P>
            </Section>

            <Section
              id="information-collected"
              title="2. Information we collect"
            >
              <P>
                We collect information you provide directly to us and
                information generated automatically when you use the service.
              </P>
              <p className="font-medium text-slate-700">
                Information you provide:
              </p>
              <Ul
                items={[
                  "Account information: your email address and password (or Google account details if you sign in with Google)",
                  "Grocery lists: the item names you add to your shopping lists",
                  "Uploaded documents: flyers, catalogues and pamphlets you upload for price extraction",
                  "Store names: optional labels you add to uploaded documents",
                  "Feedback: responses to our in-app feedback surveys",
                ]}
              />
              <p className="font-medium text-slate-700 mt-4">
                Information collected automatically:
              </p>
              <Ul
                items={[
                  "Usage data: pages visited, features used, actions taken within the app",
                  "Device information: browser type, operating system, device type",
                  "Log data: IP address, timestamps, error reports",
                  "Authentication tokens: session cookies used to keep you signed in",
                ]}
              />
              <P>
                We do not collect payment card information directly. If and when
                payments are introduced, they will be processed by a compliant
                third-party payment provider and we will never see or store your
                card details.
              </P>
            </Section>

            <Section id="how-we-use" title="3. How we use your information">
              <P>We use the information we collect to:</P>
              <Ul
                items={[
                  "Create and manage your account",
                  "Provide the price comparison service — matching your list items against prices extracted from your uploaded flyers",
                  "Cache parsed document data to avoid re-processing the same flyer multiple times (this also reduces your costs)",
                  "Send transactional emails such as account confirmation and password resets",
                  "Respond to your support requests",
                  "Understand how the service is used in order to improve it",
                  "Enforce our Terms of Service and prevent abuse",
                  "Comply with legal obligations under South African law",
                ]}
              />
              <P>
                We do not use your personal information for automated
                decision-making that produces legal or similarly significant
                effects about you.
              </P>
              <P>
                We do not send marketing emails. If this changes, we will ask
                for your explicit consent first.
              </P>
            </Section>

            <Section
              id="ai-processing"
              title="4. AI processing of your documents"
            >
              <P>
                This section is important. When you upload a flyer or catalogue,
                we send the document to third-party AI services to extract
                product names and prices. You should understand how this works.
              </P>
              <p className="font-medium text-slate-700">
                Which AI services we use:
              </p>
              <Ul
                items={[
                  "Google Gemini 2.5 Flash — our primary document parsing model. Operated by Google LLC. Documents are sent to Google's API for processing.",
                  "Anthropic Claude Sonnet — our fallback parsing model, used when Gemini returns insufficient results. Operated by Anthropic PBC. Documents are sent to Anthropic's API for processing.",
                ]}
              />
              <p className="font-medium text-slate-700 mt-4">
                What this means for you:
              </p>
              <Ul
                items={[
                  "The content of your uploaded flyers is transmitted to Google and/or Anthropic for AI processing",
                  "These providers process data under their own privacy policies and data processing agreements",
                  "We do not send your name, email address or account details to these providers — only the document content",
                  "Grocery flyers are generally public marketing documents, not personal information",
                  "If a document you upload contains personal information (such as a personalised offer with your name), you should be aware it will be processed by AI",
                  "We cache the extracted price data so that the same flyer does not need to be re-processed — this means one document may serve multiple users",
                ]}
              />
              <P>
                By uploading a document to Vopari, you acknowledge that its
                contents will be processed by AI services as described above.
              </P>
            </Section>

            <Section id="data-sharing" title="5. Data sharing">
              <P>
                We do not sell, rent or trade your personal information to any
                third party for their own marketing purposes. Full stop.
              </P>
              <P>
                We share your information only in the following circumstances:
              </P>
              <Ul
                items={[
                  "Service providers: companies that help us operate the service, including Supabase (database and authentication, operated by Supabase Inc.), Vercel (hosting, operated by Vercel Inc.), Google (AI processing and OAuth), and Anthropic (AI processing). These providers process data only on our behalf and under contractual data protection obligations.",
                  "Legal requirements: if we are required to disclose information by law, court order or government authority in South Africa, we will comply.",
                  "Business transfers: if Vopari is acquired by or merged with another company, your information may be transferred as part of that transaction. We will notify you before your information is transferred and becomes subject to a different privacy policy.",
                  "With your consent: in any other circumstances, only with your explicit consent.",
                ]}
              />
            </Section>

            <Section id="data-storage" title="6. Data storage and security">
              <P>
                Your data is stored on Supabase infrastructure, which uses
                PostgreSQL databases hosted on AWS. Data is stored in the
                US-East (N. Virginia) region by default.
              </P>
              <P>
                Uploaded documents are stored in Supabase Storage with private
                access controls — only you can access your own uploaded files.
                Row-level security policies ensure that your lists, items and
                parsed data are accessible only to your account.
              </P>
              <P>We implement the following security measures:</P>
              <Ul
                items={[
                  "All data in transit is encrypted using TLS 1.2 or higher",
                  "Passwords are never stored — authentication is managed by Supabase Auth using bcrypt hashing",
                  "Google OAuth tokens are managed by Supabase and never stored by us directly",
                  "Row-level security on all database tables ensures data isolation between users",
                  "API keys and secrets are stored as environment variables and never exposed to the browser",
                ]}
              />
              <P>
                No method of transmission over the internet or electronic
                storage is 100% secure. While we implement commercially
                reasonable measures to protect your information, we cannot
                guarantee absolute security. If you become aware of a security
                vulnerability, please contact us immediately at {CONTACT_EMAIL}.
              </P>
            </Section>

            <Section id="retention" title="7. Data retention">
              <P>
                We retain your personal information for as long as your account
                is active or as needed to provide the service.
              </P>
              <Ul
                items={[
                  "Account data: retained until you delete your account",
                  "Grocery lists and items: retained until you delete them or your account",
                  "Uploaded documents: automatically deleted when their validity period expires (based on dates extracted from the flyer) or after 30 days if no validity dates are found. You can also delete documents manually at any time.",
                  "Parsed price data: deleted when the parent document is deleted",
                  "Feedback responses: retained for up to 2 years to inform product decisions, then anonymised",
                  "Log data: retained for up to 90 days for security and debugging purposes",
                ]}
              />
              <P>
                When you delete your account, we will delete or anonymise your
                personal information within 30 days, except where we are
                required to retain it for legal or compliance purposes.
              </P>
            </Section>

            <Section id="your-rights" title="8. Your rights under POPIA">
              <P>
                Under the Protection of Personal Information Act 4 of 2013
                (POPIA), you have the following rights regarding your personal
                information:
              </P>
              <Ul
                items={[
                  "Right to access: you can request a copy of the personal information we hold about you",
                  "Right to correction: you can request that we correct inaccurate or incomplete personal information",
                  "Right to deletion: you can request that we delete your personal information, subject to legal retention requirements",
                  "Right to object: you can object to the processing of your personal information in certain circumstances",
                  "Right to data portability: you can request your data in a structured, commonly used format",
                  "Right to lodge a complaint: you can lodge a complaint with the Information Regulator of South Africa at inforeg.org.za",
                ]}
              />
              <P>
                To exercise any of these rights, email us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald-700 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                with "POPIA Rights Request" in the subject line. We will respond
                within 30 days.
              </P>
              <P>
                You can delete your uploaded flyers and grocery lists directly
                from within the app at any time without contacting us.
              </P>
            </Section>

            <Section id="cookies" title="9. Cookies">
              <P>
                We use cookies and similar technologies to keep you signed in
                and to understand how the service is used.
              </P>
              <Ul
                items={[
                  "Authentication cookies: set by Supabase to maintain your session. These are essential for the service to function. They expire when you sign out or after 7 days of inactivity.",
                  "Preference cookies: used to remember settings such as your selected grocery list.",
                ]}
              />
              <P>
                We do not use advertising cookies or tracking cookies from
                third-party advertisers. We do not display advertisements.
              </P>
              <P>
                You can control cookies through your browser settings, but
                disabling essential cookies will prevent you from signing in.
              </P>
            </Section>

            <Section id="children" title="10. Children">
              <P>
                Vopari is not directed at children under the age of 18. We do
                not knowingly collect personal information from children. If you
                believe a child has provided us with personal information,
                please contact us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald-700 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                and we will delete it promptly.
              </P>
            </Section>

            <Section id="changes" title="11. Changes to this policy">
              <P>
                We may update this Privacy Policy from time to time. When we
                make material changes, we will notify you by displaying a notice
                within the app and updating the "Last updated" date at the top
                of this page.
              </P>
              <P>
                Your continued use of Vopari after changes become effective
                constitutes your acceptance of the updated policy. If you do not
                agree to the changes, you should stop using the service and
                delete your account.
              </P>
            </Section>

            <Section id="contact" title="12. Contact us">
              <P>
                If you have questions about this Privacy Policy or how we handle
                your personal information, please contact us:
              </P>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-2 not-prose">
                <p className="text-sm font-medium text-slate-800">
                  Vopari Privacy
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="text-sm text-slate-400">
                  We aim to respond within 2 business days.
                </p>
              </div>
              <P>
                You also have the right to lodge a complaint with South Africa's
                Information Regulator at{" "}
                <a
                  href="https://www.inforeg.org.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline"
                >
                  www.inforeg.org.za
                </a>
                .
              </P>
            </Section>

            {/* Footer nav */}
            <Separator className="mb-8 bg-slate-100" />
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/terms" className="text-emerald-700 hover:underline">
                Terms of Service →
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
