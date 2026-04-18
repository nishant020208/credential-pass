import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, QrCode, Building2, Zap, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";

const features = [
  { icon: QrCode, title: "Verify in <10s", body: "Employers scan a QR — no logins, no apps. Sub-2s public verification." },
  { icon: Lock, title: "Tamper-proof hash", body: "Every credential is sealed with a SHA-256 cryptographic fingerprint." },
  { icon: Building2, title: "Trusted issuance", body: "Only whitelisted ITI trainers and principals can issue credentials." },
  { icon: Sparkles, title: "AI skill summary", body: "Auto-generated recruiter-ready summary on every passport." },
  { icon: Zap, title: "Offline-ready", body: "Trainers can issue without internet — syncs automatically when online." },
  { icon: ShieldCheck, title: "Institution Trust Score", body: "Live trust score based on issuance and revocation history." },
];

const Index = () => (
  <AppShell>
    <section className="relative pt-12 pb-20 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium text-muted-foreground mb-6">
          <span className="size-2 rounded-full bg-success animate-pulse" />
          Verifiable Micro-Skill Passport
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] max-w-4xl mx-auto">
          Skills you can <span className="bg-gradient-primary bg-clip-text text-transparent">trust</span>.<br />
          Verified in seconds.
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-xl mx-auto">
          Credify gives ITI & Polytechnic graduates a tamper-proof skill passport employers can verify with a single QR scan.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
          <Button asChild size="lg" className="bg-gradient-primary shadow-glow hover:scale-[1.02] transition">
            <Link to="/auth">Sign in to issue credentials <ArrowRight className="size-4 ml-1" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/verify/aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa">Try a sample verification</Link>
          </Button>
        </div>
      </motion.div>
    </section>

    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((f, i) => (
        <motion.div key={f.title}
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="glass-card p-6 hover:border-primary/40 transition group">
          <div className="size-10 rounded-xl bg-primary/15 grid place-items-center mb-4 group-hover:scale-110 transition">
            <f.icon className="size-5 text-primary-glow" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
        </motion.div>
      ))}
    </section>

    <section className="mt-20 glass-card p-8 md:p-12 text-center">
      <h2 className="text-3xl font-bold tracking-tight">Demo accounts</h2>
      <p className="text-muted-foreground mt-2">All pre-whitelisted. Sign up with any password (≥6 chars).</p>
      <div className="grid sm:grid-cols-3 gap-3 mt-6 text-sm font-mono text-left max-w-3xl mx-auto">
        <div className="p-3 rounded-lg bg-surface-2 border border-border"><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ITI Admin</div>admin@credify.gov.in</div>
        <div className="p-3 rounded-lg bg-surface-2 border border-border"><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Principal</div>principal@iti-mumbai.gov.in</div>
        <div className="p-3 rounded-lg bg-surface-2 border border-border"><div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Trainer</div>trainer@iti-mumbai.gov.in</div>
      </div>
    </section>
  </AppShell>
);

export default Index;
