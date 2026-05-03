import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CalendarCheck, CreditCard, BookOpen, ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { usePortal } from "@/components/layout/PortalLayout";

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

export default function PortalDashboard() {
  const { student } = usePortal();
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}api/portal/fees`, { credentials: "include" }).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}api/portal/attendance`, { credentials: "include" }).then(r => r.json()),
    ]).then(([f, a]) => {
      setFees(f);
      setAttendance(a);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-serif text-3xl text-primary mb-1">
          Namaskaram, {student.fullName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm">Enrolled {enrolledDate}</p>
      </div>

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
