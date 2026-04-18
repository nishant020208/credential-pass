import { Link } from "react-router-dom";
import { ShieldCheck, QrCode, Lock, FileCheck, ArrowRight, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { QrScanner } from "@/components/QrScanner";

const features = [
  { icon: QrCode, title: "Verify in seconds", body: "Employers scan one QR code and instantly see what your trainee can actually do — no calls, no follow-ups, no paperwork." },
  { icon: Lock, title: "Tamper-proof by design", body: "Every skill is sealed with a cryptographic hash. If even one character changes, the credential breaks. Trust is built in." },
  { icon: GraduationCap, title: "Built around real ITI workflows", body: "Students request, trainers vouch, principals approve. Three real signatures — not just a piece of paper." },
  { icon: FileCheck, title: "Government-style certificates", body: "Download a beautiful PDF with the tricolour, your photo, your skills, and a QR code that recruiters can verify on the spot." },
];

const Index = () => (
  <AppShell>
    {/* Humanised hero */}
    <section className="bg-card border border-border rounded-lg p-8 md:p-12 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-3xl relative">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-success/10 text-success text-xs font-medium mb-4">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          Live · Government of India initiative
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-foreground">
          A skill passport that finally <span className="text-primary">means something.</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-5 max-w-2xl leading-relaxed">
          For India's 12 million ITI and Polytechnic graduates, getting hired shouldn't depend on paper certificates that anyone can forge. NATIONAL SKILL REGISTRY gives every student a verifiable, QR-scannable record of what they actually know — backed by their trainer, signed by their principal, and trusted by employers.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-7">
          <Button asChild size="lg">
            <Link to="/auth">Sign in to your registry <ArrowRight className="size-4 ml-1.5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/search">I'm an employer →</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><Building2 className="size-3.5" /> 44 institutions onboarded</div>
          <div className="flex items-center gap-1.5"><GraduationCap className="size-3.5" /> 8,900+ students</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> 50,000+ credentials</div>
        </div>
      </div>
    </section>

    <section className="mb-8">
      <QrScanner />
    </section>

    <section className="grid sm:grid-cols-2 gap-4 mb-8">
      {features.map(f => (
        <div key={f.title} className="bg-card border border-border rounded-lg p-6">
          <div className="size-10 rounded-md bg-primary/10 grid place-items-center mb-3">
            <f.icon className="size-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base mb-1.5 text-foreground">{f.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
        </div>
      ))}
    </section>

    <section className="bg-card border border-border rounded-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Try the demo accounts</h2>
        <span className="text-xs text-muted-foreground">Password for all: <code className="font-mono text-foreground bg-surface-1 px-1.5 py-0.5 rounded">Credify@2026</code></span>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Each role shows a different dashboard and approval power.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <DemoCard role="ITI Admin" email="admin@credify.in" tone="primary" />
        <DemoCard role="Principal" email="principal@credify.in" tone="primary" />
        <DemoCard role="Trainer" email="trainer@credify.in" tone="primary" />
        <DemoCard role="Student" email="priya.welder@nsr.in" tone="success" passwordOverride="Priya@2026" />
      </div>
    </section>
  </AppShell>
);

const DemoCard = ({ role, email, tone, passwordOverride }: { role: string; email: string; tone: "primary" | "success"; passwordOverride?: string }) => (
  <div className="p-4 rounded-md bg-surface-1 border border-border">
    <div className={`text-[10px] uppercase tracking-[0.18em] font-bold mb-1.5 ${tone === "success" ? "text-success" : "text-primary"}`}>{role}</div>
    <div className="font-mono text-xs break-all">{email}</div>
    {passwordOverride && <div className="text-[10px] text-muted-foreground mt-1">pwd: {passwordOverride}</div>}
  </div>
);

export default Index;
