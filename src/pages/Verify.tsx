import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Building2, Sparkles, Download, ArrowLeft, Hash, History, Clock, Eye } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { levelLabel, levelColor, statusBadgeClass, statusLabel, computeSkillScore, scoreTier } from "@/lib/credify";
import { SiteFooter } from "@/components/SiteFooter";

type Student = { id: string; name: string; trade: string; institution_id: string };
type Inst = { id: string; name: string; location: string | null };
type Cred = { id: string; level: number; status: string; hash: string; created_at: string; skills: { name: string } | null };
type Scan = { id: string; scanned_at: string };

const Verify = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [institution, setInstitution] = useState<Inst | null>(null);
  const [creds, setCreds] = useState<Cred[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [verifyMs, setVerifyMs] = useState<number | null>(null);
  const startedRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!studentId) return;
    let cancel = false;
    startedRef.current = performance.now();
    (async () => {
      setLoading(true);
      const { data: s } = await supabase.from("students").select("id,name,trade,institution_id").eq("id", studentId).maybeSingle();
      if (!s) { setNotFound(true); setLoading(false); return; }
      const [{ data: inst }, { data: c }, { data: sc }] = await Promise.all([
        supabase.from("institutions").select("*").eq("id", s.institution_id).maybeSingle(),
        supabase.from("credentials").select("id,level,status,hash,created_at,skills(name)").eq("student_id", studentId).order("created_at", { ascending: false }),
        supabase.from("scan_logs").select("id,scanned_at").eq("student_id", studentId).order("scanned_at", { ascending: false }).limit(5),
      ]);
      if (cancel) return;
      setStudent(s as Student); setInstitution(inst as Inst); setCreds((c ?? []) as Cred[]);
      setScans((sc ?? []) as Scan[]);
      setVerifyMs(performance.now() - startedRef.current);
      setLoading(false);

      // Log this scan (fire & forget)
      supabase.from("scan_logs").insert({ student_id: studentId, user_agent: navigator.userAgent.slice(0, 200) });

      // AI summary (non-blocking)
      const skillsList = (c ?? []).map((x: any) => ({ name: x.skills?.name ?? "Skill", level: x.level, status: x.status }));
      supabase.functions.invoke("skill-summary", { body: { studentName: s.name, trade: s.trade, skills: skillsList } })
        .then(({ data }) => { if (!cancel && data?.summary) setSummary(data.summary); })
        .catch(() => {});
    })();
    return () => { cancel = true; };
  }, [studentId]);

  const validCreds = creds.filter(c => c.status === "valid");
  const allRevoked = creds.length > 0 && validCreds.length === 0 && creds.every(c => c.status === "revoked" || c.status === "rejected");
  const overallValid = validCreds.length > 0;
  const score = useMemo(() => computeSkillScore(creds), [creds]);
  const tier = scoreTier(score);
  const trustScore = creds.length === 0 ? 100 : Math.round((validCreds.length / creds.length) * 100);
  const lastScan = scans[1]; // skip current scan we just inserted; show prior

  const downloadPDF = () => {
    if (!student || !institution) return;
    const doc = new jsPDF();
    const pageW = 210;
    doc.setFillColor(255, 153, 51); doc.rect(0, 0, pageW, 2, "F");
    doc.setFillColor(255, 255, 255); doc.rect(0, 2, pageW, 2, "F");
    doc.setFillColor(19, 136, 8); doc.rect(0, 4, pageW, 2, "F");
    doc.setFillColor(30, 58, 138); doc.rect(0, 6, pageW, 34, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18).setFont("helvetica", "bold").text("NATIONAL SKILL REGISTRY", 14, 22);
    doc.setFontSize(9).setFont("helvetica", "normal").text("Ministry of Skill Development & Entrepreneurship · Government of India", 14, 28);
    doc.setFontSize(8).text("Verifiable Micro-Skill Passport", 14, 33);

    doc.setFontSize(8).text("CERTIFICATE OF SKILL VERIFICATION", pageW - 14, 22, { align: "right" });
    doc.setFontSize(7);
    doc.text(`Issued: ${new Date().toLocaleDateString("en-IN")}`, pageW - 14, 28, { align: "right" });
    doc.text(`Ref: ${student.id.slice(0, 8).toUpperCase()}`, pageW - 14, 33, { align: "right" });

    doc.setTextColor(20, 20, 30);
    doc.setFontSize(10).setFont("helvetica", "bold").text("CREDENTIAL HOLDER", 14, 56);
    doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(30, 58, 138).text(student.name, 14, 67);
    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(60, 60, 70);
    doc.text(`Trade: ${student.trade}`, 14, 74);
    doc.text(`Institution: ${institution.name}${institution.location ? `, ${institution.location}` : ""}`, 14, 80);
    doc.setFontSize(8).setTextColor(100, 100, 115);
    doc.text(`Verify online: ${window.location.origin}/verify/${student.id}`, 14, 86);

    autoTable(doc, {
      startY: 94,
      head: [["Skill", "Level", "Status", "Credential Hash"]],
      body: validCreds.map(c => [c.skills?.name ?? "—", `L${c.level} ${levelLabel(c.level)}`, "VERIFIED", c.hash.slice(0, 24) + "…"]),
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 50] },
      alternateRowStyles: { fillColor: [248, 249, 251] },
    });

    doc.setFillColor(255, 153, 51); doc.rect(0, 287, pageW, 2, "F");
    doc.setFillColor(255, 255, 255); doc.rect(0, 289, pageW, 2, "F");
    doc.setFillColor(19, 136, 8); doc.rect(0, 291, pageW, 2, "F");
    doc.setFontSize(8).setTextColor(110, 110, 125);
    doc.text("Sealed with SHA-256. Verifiable in real-time via the QR code on the public registry.", pageW / 2, 281, { align: "center" });

    doc.save(`NSR-${student.name.replace(/\s+/g, "_")}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen container py-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="skeleton h-32" />
          <div className="grid sm:grid-cols-2 gap-4"><div className="skeleton h-24" /><div className="skeleton h-24" /></div>
          <div className="skeleton h-48" />
        </div>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center">
          <ShieldAlert className="size-12 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Credential not found</h1>
          <p className="text-muted-foreground mt-2">This verification link is invalid.</p>
          <Button asChild variant="outline" className="mt-6"><Link to="/"><ArrowLeft className="size-4 mr-1" />Home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="gov-strip" />
      <header className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-primary grid place-items-center"><ShieldCheck className="size-5 text-primary-foreground" /></div>
            <div className="leading-tight">
              <div className="font-bold text-sm">NATIONAL SKILL REGISTRY</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Govt. of India · Public verification</div>
            </div>
          </Link>
          <Button onClick={downloadPDF} variant="outline" size="sm"><Download className="size-4 mr-1" />Download Certificate</Button>
        </div>
      </header>

      <main className="container py-6 max-w-5xl">
        {/* HUGE one-tap verification banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`rounded-lg border-2 p-6 mb-6 flex items-center gap-5 relative overflow-hidden ${
            overallValid ? "border-success bg-success/5" : "border-destructive bg-destructive/5"
          }`}
        >
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.25, 0] }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className={`absolute inset-0 ${overallValid ? "bg-success" : "bg-destructive"}`}
          />
          <motion.div
            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className={`size-20 rounded-full grid place-items-center shrink-0 z-10 ${overallValid ? "bg-success" : "bg-destructive"}`}
          >
            {overallValid ? <ShieldCheck className="size-10 text-success-foreground" /> : <ShieldAlert className="size-10 text-destructive-foreground" />}
          </motion.div>
          <div className="z-10 flex-1">
            <div className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${overallValid ? "text-success" : "text-destructive"}`}>
              {overallValid ? "✅ VERIFIED" : allRevoked ? "❌ REVOKED" : "⚠️ NO CREDENTIALS"}
            </div>
            <div className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1"><Clock className="size-3.5" />Verified in {verifyMs ? (verifyMs / 1000).toFixed(1) : "—"}s</span>
              <span>·</span>
              <span>{validCreds.length} valid · {creds.length - validCreds.length} other</span>
              <span>·</span>
              <span>SHA-256 sealed</span>
              {lastScan && <><span>·</span><span className="flex items-center gap-1"><Eye className="size-3.5" />Last verified {timeAgo(lastScan.scanned_at)}</span></>}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 mb-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Skill Passport Holder</div>
            <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
            <div className="text-sm text-muted-foreground mt-1">Trade: <span className="text-foreground font-medium">{student.trade}</span></div>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <Building2 className="size-4 text-muted-foreground" />
              <span>{institution?.name}{institution?.location ? `, ${institution.location}` : ""}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="p-3 rounded-md bg-surface-1 border border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Skill Score</div>
                <div className={`text-2xl font-bold ${tier.color}`}>{score}<span className="text-sm text-muted-foreground">/100</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">{tier.label}</div>
              </div>
              <div className="p-3 rounded-md bg-surface-1 border border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Trust Score</div>
                <div className="text-2xl font-bold text-success">{trustScore}%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Institution</div>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-md bg-surface-1 border border-border">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold mb-2">
                <Sparkles className="size-3.5" />Skill Summary
              </div>
              {summary ? <p className="text-sm leading-relaxed text-foreground">{summary}</p> : <div className="space-y-1.5"><div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-4/5" /></div>}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center justify-center">
            <div className="bg-white p-3 rounded-md border border-border">
              <QRCodeSVG value={`${window.location.origin}/verify/${student.id}`} size={170} />
            </div>
            <div className="text-xs text-muted-foreground mt-3 text-center">Scan to re-verify</div>
            {scans.length > 0 && (
              <div className="mt-4 w-full pt-4 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Recent scans</div>
                <div className="space-y-1.5 text-xs">
                  {scans.slice(0, 4).map(s => <div key={s.id} className="flex items-center gap-1.5 text-muted-foreground"><Eye className="size-3" />{timeAgo(s.scanned_at)}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border font-semibold bg-surface-1">Skills ({creds.length})</div>
          {creds.length === 0
            ? <div className="p-12 text-center text-muted-foreground">No credentials issued yet.</div>
            : <div className="divide-y divide-border">
                {creds.map(c => (
                  <div key={c.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="font-semibold">{c.skills?.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mt-1"><Hash className="size-3" />{c.hash.slice(0, 32)}…</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Issued {new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={levelColor(c.level)}>L{c.level} · {levelLabel(c.level)}</Badge>
                      <Badge className={statusBadgeClass(c.status)}>{statusLabel(c.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">Public verification page · No login required · Powered by NATIONAL SKILL REGISTRY</p>
      </main>
      <SiteFooter />
    </div>
  );
};

function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.round(s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export default Verify;
