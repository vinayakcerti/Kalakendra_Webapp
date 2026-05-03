import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CalendarCheck, CreditCard, BookOpen, ArrowRight, CheckCircle, XCircle, Clock, Info, AlertTriangle, CalendarDays, X as XIcon, Megaphone } from "lucide-react";
import { usePortal } from "@/components/layout/PortalLayout";
import { format } from "date-fns";

interface Fee {
  id: string;
  description: string;
  amountOre: number;
  currency: string;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  batchName: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  pinned: boolean;
  expiresAt: string | null;
  createdAt: string;
}

function formatSek(ore: number) {
  return (ore / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
};

const ANNOUNCEMENT_CFG: Record<string, {
  Icon: typeof Info;
  bar: string;
  bg: string;
  text: string;
  border: string;
}> = {
  info:    { Icon: Info,          bar: "bg-blue-400",  bg: "bg-blue-50",   text: "text-blue-800",   border: "border-blue-200" },
  event:   { Icon: CalendarDays,  bar: "bg-secondary", bg: "bg-amber-50",  text: "text-amber-800",  border: "border-amber-200" },
  closure: { Icon: XIcon,         bar: "bg-slate-400", bg: "bg-slate-50",  text: "text-slate-700",  border: "border-slate-200" },
  urgent:  { Icon: AlertTriangle, bar: "bg-red-500",   bg: "bg-red-50",    text: "text-red-800",    border: "border-red-200" },
};

export default function PortalDashboard() {
  const { student } = usePortal();
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const BASE = import.meta.env.BASE_URL;

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}api/portal/fees`, { credentials: "include" }).then(r => r.json()),
      fetch(`${BASE}api/portal/attendance`, { credentials: "include" }).then(r => r.json()),
      fetch(`${BASE}api/announcements?active=true`).then(r => r.json()),
    ]).then(([f, a, ann]) => {
      setFees(f);
      setAttendance(a);
      setAnnouncements(ann);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (!student) return null;

  const pendingFees = fees.filter(f => f.status === "pending" || f.status === "overdue");
  const totalOwed = pendingFees.reduce((s, f) => s + f.amountOre, 0);
  const recent = attendance.slice(0, 5);
  const presentCount = attendance.filter(a => a.status === "present").length;
  const totalCount = attendance.length;
  const attendancePct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null;

  const enrolledDate = new Date(student.enrolledAt).toLocaleDateString("sv-SE", {
    day: "numeric", month: "long", year: "numeric",
  });

  const visibleAnnouncements = announcements.filter(a => !dismissed.has(a.id));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-serif text-3xl text-primary mb-1">
          Namaskaram, {student.fullName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm">Enrolled {enrolledDate}</p>
      </div>

      {/* Announcements */}
      {!loading && visibleAnnouncements.length > 0 && (
        <div className="space-y-3">
          {visibleAnnouncements.map(ann => {
            const cfg = ANNOUNCEMENT_CFG[ann.type] ?? ANNOUNCEMENT_CFG["info"];
            const Icon = cfg.Icon;
            return (
              <div
                key={ann.id}
                className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
              >
                <div className={`h-1 ${cfg.bar}`} />
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <Icon size={16} className={cfg.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${cfg.text}`}>{ann.title}</p>
                    <p className={`text-sm mt-1 leading-relaxed whitespace-pre-line ${cfg.text} opacity-90`}>
                      {ann.body}
                    </p>
                    {ann.expiresAt && (
                      <p className={`text-xs mt-2 opacity-60 ${cfg.text}`}>
                        Until {format(new Date(ann.expiresAt), "d MMM yyyy")}
                      </p>
                    )}
                  </div>
                  {!ann.pinned && (
                    <button
                      onClick={() => setDismissed(prev => new Set([...prev, ann.id]))}
                      className={`shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity ${cfg.text}`}
                      aria-label="Dismiss"
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading skeleton for announcements */}
      {loading && (
        <div className="space-y-3">
          <div className="h-20 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      )}

      {/* Batch card */}
      {student.batchName && (
        <div className="rounded-xl border border-secondary/30 bg-card p-6 flex items-start gap-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Current Batch</p>
            <p className="font-serif text-xl text-primary">{student.batchName}</p>
            {student.batchSchedule && (
              <p className="text-sm text-muted-foreground mt-1">{student.batchSchedule}</p>
            )}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Fees */}
        <Link href="/portal/fees">
          <a className="block rounded-xl border border-secondary/30 bg-card p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard size={18} className="text-primary" />
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            {loading ? (
              <div className="h-8 bg-muted/40 rounded animate-pulse w-24" />
            ) : pendingFees.length === 0 ? (
              <>
                <p className="font-serif text-2xl text-primary">All clear</p>
                <p className="text-sm text-muted-foreground mt-1">No outstanding fees</p>
              </>
            ) : (
              <>
                <p className="font-serif text-2xl text-primary">{formatSek(totalOwed)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pendingFees.length} fee{pendingFees.length !== 1 ? "s" : ""} outstanding
                </p>
              </>
            )}
          </a>
        </Link>

        {/* Attendance */}
        <Link href="/portal/attendance">
          <a className="block rounded-xl border border-secondary/30 bg-card p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarCheck size={18} className="text-primary" />
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            {loading ? (
              <div className="h-8 bg-muted/40 rounded animate-pulse w-20" />
            ) : attendancePct === null ? (
              <>
                <p className="font-serif text-2xl text-primary">—</p>
                <p className="text-sm text-muted-foreground mt-1">No attendance recorded yet</p>
              </>
            ) : (
              <>
                <p className="font-serif text-2xl text-primary">{attendancePct}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {presentCount} of {totalCount} classes attended
                </p>
              </>
            )}
          </a>
        </Link>
      </div>

      {/* Recent attendance */}
      {!loading && recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-primary">Recent Classes</h2>
            <Link href="/portal/attendance">
              <a className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                View all
              </a>
            </Link>
          </div>
          <div className="space-y-2">
            {recent.map(a => (
              <div key={a.id} className="flex items-center gap-4 py-3 border-b border-secondary/10 last:border-0">
                {a.status === "present" ? (
                  <CheckCircle size={16} className="text-green-600 shrink-0" />
                ) : a.status === "absent" ? (
                  <XCircle size={16} className="text-red-500 shrink-0" />
                ) : (
                  <Clock size={16} className="text-amber-500 shrink-0" />
                )}
                <span className="text-sm flex-1">{formatDate(a.date)}</span>
                <span className="text-xs capitalize text-muted-foreground">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outstanding fees detail */}
      {!loading && pendingFees.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-primary">Outstanding Fees</h2>
            <Link href="/portal/fees">
              <a className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                View all
              </a>
            </Link>
          </div>
          <div className="space-y-2">
            {pendingFees.slice(0, 3).map(f => (
              <div key={f.id} className="flex items-center gap-4 py-3 border-b border-secondary/10 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{f.description}</p>
                  {f.dueDate && (
                    <p className="text-xs text-muted-foreground">Due {formatDate(f.dueDate)}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border capitalize ${STATUS_STYLE[f.status] ?? ""}`}>
                  {f.status}
                </span>
                <span className="text-sm font-medium tabular-nums">{formatSek(f.amountOre)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
