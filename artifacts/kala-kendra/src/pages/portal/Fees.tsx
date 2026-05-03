import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";

interface Fee {
  id: string;
  description: string;
  amountOre: number;
  currency: string;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

function formatSek(ore: number) {
  return (ore / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, { bar: string; badge: string; label: string }> = {
  paid:    { bar: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200",   label: "Paid" },
  pending: { bar: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200",   label: "Pending" },
  overdue: { bar: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200",         label: "Overdue" },
  waived:  { bar: "bg-slate-300",  badge: "bg-slate-50 text-slate-600 border-slate-200",   label: "Waived" },
};

export default function PortalFees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/portal/fees`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { setFees(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? fees : fees.filter(f => f.status === filter);
  const totalOwed = fees.filter(f => f.status === "pending" || f.status === "overdue").reduce((s, f) => s + f.amountOre, 0);
  const totalPaid = fees.filter(f => f.status === "paid").reduce((s, f) => s + f.amountOre, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-primary mb-1">Fees</h1>
        <p className="text-muted-foreground text-sm">Your fee history and any outstanding payments</p>
      </div>

      {/* Summary */}
      {!loading && fees.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-secondary/30 bg-card p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Outstanding</p>
            <p className="font-serif text-2xl text-primary">{formatSek(totalOwed)}</p>
          </div>
          <div className="rounded-xl border border-secondary/30 bg-card p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Total paid</p>
            <p className="font-serif text-2xl text-primary">{formatSek(totalPaid)}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "overdue", "paid"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-secondary/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? "All" : STATUS_STYLE[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="mx-auto mb-4 text-muted-foreground/40" size={40} />
          <p className="text-muted-foreground text-sm">No fees {filter !== "all" ? `with status "${filter}"` : "recorded yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => {
            const st = STATUS_STYLE[f.status] ?? STATUS_STYLE["pending"];
            return (
              <div key={f.id} className="rounded-xl border border-secondary/20 bg-card overflow-hidden">
                <div className={`h-1 ${st.bar}`} />
                <div className="p-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{f.description}</p>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded border ${st.badge}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {f.dueDate && <span>Due {formatDate(f.dueDate)}</span>}
                      {f.paidDate && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 size={12} /> Paid {formatDate(f.paidDate)}
                        </span>
                      )}
                    </div>
                    {f.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{f.notes}</p>
                    )}
                  </div>
                  <p className="text-base font-semibold tabular-nums shrink-0">{formatSek(f.amountOre)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pb-4">
        To make a payment or query a fee, please contact the school directly.
      </p>
    </div>
  );
}
