import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  Search,
  Download,
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL;

interface ConsentFormRow {
  id: string;
  programName: string;
  programYear: string;
  enrollmentDate: string | null;
  participantName: string;
  participantDob: string | null;
  participantPhone: string | null;
  participantEmail: string | null;
  guardianName: string | null;
  emergencyContact: string | null;
  medicalConditions: string | null;
  isMinor: boolean;
  consentItems: string[];
  signatureName: string;
  guardianSignatureName: string | null;
  submittedAt: string;
  createdAt: string;
}

const CONSENT_LABELS: Record<string, string> = {
  photo_video: "Photo & Video Consent (Cl. 1)",
  financial: "Financial Responsibility (Cl. 2)",
  performance: "Performance Participation (Cl. 3)",
  creative_direction: "Creative Direction (Cl. 4)",
  attendance: "Attendance Requirements (Cl. 5)",
  withdrawal: "Withdrawal & Refund Policy (Cl. 6)",
  conduct: "Code of Conduct (Cl. 7)",
  communication: "Communication Protocol (Cl. 8)",
  social_media: "Social Media & Confidentiality (Cl. 9)",
  liability: "Liability Waiver (Cl. 10)",
  health: "Health Declaration (Cl. 11)",
};

const ALL_CONSENT_IDS = Object.keys(CONSENT_LABELS);

function formatDate(d: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "d MMM yyyy"); } catch { return d; }
}

function formatDateTime(d: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "d MMM yyyy, HH:mm"); } catch { return d; }
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3 text-sm border-b border-secondary/10 pb-2.5">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground break-words">{value || "—"}</span>
    </div>
  );
}

function ConsentBadge({ id, checked }: { id: string; checked: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-3 text-xs border ${
        checked
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-secondary/20 bg-background text-muted-foreground"
      }`}
    >
      {checked ? (
        <CheckCircle2 size={12} className="text-green-600 shrink-0" />
      ) : (
        <div className="w-3 h-3 border border-muted-foreground/40 rounded-sm shrink-0" />
      )}
      <span>{CONSENT_LABELS[id] ?? id}</span>
    </div>
  );
}

function printForm(form: ConsentFormRow) {
  const checkedLabels = form.consentItems
    .map((id) => CONSENT_LABELS[id] ?? id)
    .join("\n  • ");

  const content = `
PARTICIPANT CONSENT FORM — KALA KENDRA SWEDEN
==============================================

Submitted: ${formatDateTime(form.submittedAt)}

PROGRAMME DETAILS
Programme / Event: ${form.programName}
Year / Batch:      ${form.programYear || "—"}
Enrollment Date:   ${formatDate(form.enrollmentDate)}

PARTICIPANT DETAILS
Full Name:         ${form.participantName}
Date of Birth:     ${formatDate(form.participantDob)}
Phone:             ${form.participantPhone || "—"}
Email:             ${form.participantEmail || "—"}
Emergency Contact: ${form.emergencyContact || "—"}
Minor (u/18):      ${form.isMinor ? "Yes" : "No"}
${form.isMinor && form.guardianName ? `Guardian Name:     ${form.guardianName}` : ""}

HEALTH DECLARATION
${form.medicalConditions || "No conditions disclosed."}

CONSENT ITEMS ACKNOWLEDGED
  • ${checkedLabels || "None"}

SIGNATURE
Participant:       ${form.signatureName}
${form.isMinor && form.guardianSignatureName ? `Guardian:          ${form.guardianSignatureName}` : ""}
Date:              ${formatDate(form.submittedAt)}
`.trim();

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<pre style="font-family:monospace;font-size:13px;padding:2rem;white-space:pre-wrap">${content}</pre>`);
  win.document.close();
  win.print();
}

export default function ConsentForms() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: forms = [], isLoading } = useQuery<ConsentFormRow[]>({
    queryKey: ["consent-forms"],
    queryFn: async () => {
      const res = await fetch(`${BASE}api/consent-forms`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const filtered = forms.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.participantName.toLowerCase().includes(q) ||
      f.programName.toLowerCase().includes(q) ||
      (f.participantEmail ?? "").toLowerCase().includes(q) ||
      (f.programYear ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif text-primary">Consent Forms</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? "Loading…" : `${forms.length} submission${forms.length !== 1 ? "s" : ""} received`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by participant name, programme, or email…"
          className="pl-9 rounded-none border-secondary/40 focus-visible:ring-primary bg-background"
        />
      </div>

      {/* Table header */}
      {!isLoading && filtered.length > 0 && (
        <div className="hidden md:grid grid-cols-[1fr_1fr_80px_100px_40px] gap-4 px-5 py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold border-b border-secondary/20 mb-2">
          <span>Participant</span>
          <span>Programme</span>
          <span>Consents</span>
          <span>Submitted</span>
          <span />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground">Loading consent forms…</div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center border border-secondary/20 bg-card">
          <FileText size={32} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-serif text-xl text-primary mb-2">
            {search ? "No results found" : "No submissions yet"}
          </p>
          <p className="text-muted-foreground text-sm">
            {search
              ? "Try a different search term."
              : "Consent forms submitted via the public site will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((form) => {
            const isOpen = expanded === form.id;
            const consentCount = form.consentItems.length;
            const allSigned = consentCount === ALL_CONSENT_IDS.length;

            return (
              <div
                key={form.id}
                className={`border transition-colors ${
                  isOpen ? "border-secondary/50" : "border-secondary/20 hover:border-secondary/40"
                } bg-card`}
              >
                {/* Row */}
                <button
                  className="w-full text-left px-5 py-4 md:grid md:grid-cols-[1fr_1fr_80px_100px_40px] flex flex-wrap gap-2 items-center"
                  onClick={() => setExpanded(isOpen ? null : form.id)}
                >
                  {/* Participant */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{form.participantName}</span>
                      {form.isMinor && (
                        <Badge variant="outline" className="text-[10px] rounded-none border-amber-300 text-amber-700 bg-amber-50 px-1.5">
                          Minor
                        </Badge>
                      )}
                    </div>
                    {form.participantEmail && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{form.participantEmail}</p>
                    )}
                  </div>

                  {/* Programme */}
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{form.programName}</p>
                    {form.programYear && (
                      <p className="text-xs text-muted-foreground">{form.programYear}</p>
                    )}
                  </div>

                  {/* Consents */}
                  <div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 ${
                        allSigned
                          ? "bg-green-100 text-green-800"
                          : consentCount > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {consentCount} / {ALL_CONSENT_IDS.length}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-muted-foreground">
                    {formatDate(form.submittedAt)}
                  </div>

                  {/* Chevron */}
                  <div className="text-muted-foreground ml-auto md:ml-0 flex justify-end">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-secondary/20 px-5 pb-6 pt-5">
                    <div className="grid md:grid-cols-2 gap-8">

                      {/* Left: participant details */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4 flex items-center gap-2">
                          <User size={12} /> Participant Details
                        </p>
                        <div className="space-y-2.5 mb-6">
                          <DetailRow label="Full Name" value={form.participantName} />
                          <DetailRow label="Date of Birth" value={formatDate(form.participantDob)} />
                          <DetailRow label="Phone" value={form.participantPhone} />
                          <DetailRow label="Email" value={form.participantEmail} />
                          <DetailRow label="Emergency Contact" value={form.emergencyContact} />
                          <DetailRow label="Minor (u/18)" value={form.isMinor ? "Yes" : "No"} />
                          {form.isMinor && (
                            <DetailRow label="Guardian Name" value={form.guardianName} />
                          )}
                        </div>

                        <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4 flex items-center gap-2">
                          <Calendar size={12} /> Programme
                        </p>
                        <div className="space-y-2.5 mb-6">
                          <DetailRow label="Programme" value={form.programName} />
                          <DetailRow label="Year / Batch" value={form.programYear} />
                          <DetailRow label="Enrollment Date" value={formatDate(form.enrollmentDate)} />
                          <DetailRow label="Submitted At" value={formatDateTime(form.submittedAt)} />
                        </div>

                        {form.medicalConditions && (
                          <>
                            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3 flex items-center gap-2">
                              <AlertCircle size={12} /> Health Declaration
                            </p>
                            <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 leading-relaxed mb-6">
                              {form.medicalConditions}
                            </div>
                          </>
                        )}

                        <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3 flex items-center gap-2">
                          <Shield size={12} /> Signature
                        </p>
                        <div className="space-y-2.5">
                          <DetailRow label="Participant" value={form.signatureName} />
                          {form.isMinor && (
                            <DetailRow label="Guardian" value={form.guardianSignatureName} />
                          )}
                          <DetailRow label="Date Signed" value={formatDate(form.submittedAt)} />
                        </div>
                      </div>

                      {/* Right: consent items */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs uppercase tracking-widest text-secondary font-semibold flex items-center gap-2">
                            <CheckCircle2 size={12} /> Consent Items
                          </p>
                          <span className={`text-xs font-medium px-2 py-0.5 ${
                            allSigned
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {consentCount} of {ALL_CONSENT_IDS.length} acknowledged
                          </span>
                        </div>
                        <div className="space-y-1.5 mb-6">
                          {ALL_CONSENT_IDS.map((id) => (
                            <ConsentBadge
                              key={id}
                              id={id}
                              checked={form.consentItems.includes(id)}
                            />
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => printForm(form)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <Download size={13} />
                            Print / Export
                          </button>
                          <a
                            href={`mailto:${form.participantEmail ?? ""}?subject=Re: Consent Form – ${form.programName}`}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-secondary/40 text-foreground hover:border-secondary/60 transition-colors ${
                              !form.participantEmail ? "opacity-40 pointer-events-none" : ""
                            }`}
                          >
                            <Mail size={13} />
                            Email Participant
                          </a>
                          {form.participantPhone && (
                            <a
                              href={`tel:${form.participantPhone}`}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-secondary/40 text-foreground hover:border-secondary/60 transition-colors"
                            >
                              <Phone size={13} />
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
