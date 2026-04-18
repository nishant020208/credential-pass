// Shared NSR utilities
export async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function shortHash(h: string): string {
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

export function levelLabel(level: number): string {
  return ["", "Beginner", "Intermediate", "Advanced", "Expert"][level] ?? `L${level}`;
}

export function levelColor(level: number): string {
  return ["", "bg-muted text-muted-foreground", "bg-primary/15 text-primary border-primary/30", "bg-success/15 text-success border-success/30", "bg-warning/15 text-warning border-warning/40"][level] ?? "";
}

/** Status visuals: pending_trainer | pending_principal | valid | revoked | rejected | approved */
export function statusBadgeClass(status: string): string {
  switch (status) {
    case "valid":
    case "approved":
      return "bg-success text-success-foreground border-success/40";
    case "revoked":
    case "rejected":
      return "bg-destructive text-destructive-foreground border-destructive/40";
    case "pending_trainer":
    case "pending_principal":
    case "pending":
      return "bg-warning/15 text-warning border-warning/40";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
export function statusLabel(status: string): string {
  return ({
    valid: "Verified",
    approved: "Verified",
    revoked: "Revoked",
    rejected: "Rejected",
    pending_trainer: "Awaiting trainer",
    pending_principal: "Awaiting principal",
    pending: "Pending",
  } as Record<string, string>)[status] ?? status;
}

/** Skill score: weighted by level (1-4). Returns 0-100. */
export function computeSkillScore(creds: { level: number; status: string }[]): number {
  const valid = creds.filter(c => c.status === "valid");
  if (valid.length === 0) return 0;
  const weights = [0, 10, 18, 28, 40]; // L1..L4
  const earned = valid.reduce((s, c) => s + (weights[c.level] ?? 0), 0);
  // Normalise: assume "complete passport" = 6 expert-level skills = 240 pts
  const cap = 240;
  return Math.min(100, Math.round((earned / cap) * 100));
}
export function scoreTier(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Advanced", color: "text-success" };
  if (score >= 40) return { label: "Intermediate", color: "text-primary" };
  if (score > 0) return { label: "Beginner", color: "text-warning" };
  return { label: "Unranked", color: "text-muted-foreground" };
}

export type OfflineCredential = {
  tempId: string;
  studentId: string;
  studentName: string;
  skillId: string;
  skillName: string;
  level: number;
  institutionId: string;
  hash: string;
  createdAt: string;
};

const KEY = "nsr_offline_queue";
export function getOfflineQueue(): OfflineCredential[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function addToOfflineQueue(c: OfflineCredential) {
  const q = getOfflineQueue(); q.push(c);
  localStorage.setItem(KEY, JSON.stringify(q));
}
export function clearOfflineQueue() { localStorage.removeItem(KEY); }
export function removeFromQueue(tempId: string) {
  localStorage.setItem(KEY, JSON.stringify(getOfflineQueue().filter(c => c.tempId !== tempId)));
}
