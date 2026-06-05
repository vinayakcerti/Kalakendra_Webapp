import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  batchName: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("sv-SE", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  present:  { icon: CheckCircle, color: "text-green-600",  label: "Present" },
  absent:   { icon: XCircle,     color: "text-red-500",    label: "Absent" },
  late:     { icon: Clock,       color: "text-amber-500",  label: "Late" },
  excused:  { icon: Clock,       color: "text-slate-400",  label: "Excused" },
};

export default function PortalAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`${(import.meta.env.VITE_API_URL ?? "")}/api/portal/attendance`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { setRecords(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? records : records.filter(r => r.status === filter);

  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const total = records.length;
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : null;

  // Group by month
  const grouped: Record<string, AttendanceRecord[]> = {};
  filtered.forEach(r => {
    const key = r.date.slice(0, 7); // YYYY-MM
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function monthLabel(ym: string) {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-primary mb-1">Attendance</h1>
        <p className="text-muted-foreground text-sm">Your class attendance history</p>
      </div>

      {/* Summary bar */}
      {!loading && total > 0 && (
        <div className="rounded-xl border border-secondary/30 bg-card p-5">
          <div className="flex items-end gap-6 mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Attendance rate</p>
              <p className="font-serif text-3xl text-primary">{pct}%</p>
            </div>
            <div className="text-sm text-muted-foreground pb-1">
              {presentCount} present · {absentCount} absent · {total} total classes
            </div>
          </div>
          <div className="w-full bg-muted/40 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "present", "absent", "late", "excused"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-secondary/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {STATUS_CONFIG[s]?.label ?? "All"}
          </button>
        ))}
      </div>

      {/* Records grouped by month */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarCheck className="mx-auto mb-4 text-muted-foreground/40" size={40} />
          <p className="text-muted-foreground text-sm">No attendance records {filter !== "all" ? `for "${filter}"` : "yet"}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {months.map(month => (
            <div key={month}>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 capitalize">
                {monthLabel(month)}
              </h3>
              <div className="space-y-1">
                {grouped[month].map(r => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG["present"];
                  const Icon = cfg.icon;
                  return (
                    <div key={r.id} className="flex items-center gap-4 py-2.5 border-b border-secondary/10 last:border-0">
                      <Icon size={16} className={`shrink-0 ${cfg.color}`} />
                      <span className="text-sm flex-1">{formatDate(r.date)}</span>
                      <span className={`text-xs capitalize ${cfg.color}`}>{cfg.label}</span>
                      {r.notes && (
                        <span className="text-xs text-muted-foreground italic truncate max-w-32">{r.notes}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
