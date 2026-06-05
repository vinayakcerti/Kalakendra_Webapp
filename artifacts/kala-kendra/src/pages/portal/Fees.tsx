import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CreditCard, CheckCircle2, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Fee {
  id: string;
  description: string;
  amountOre: number;
  currency: string;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
  notes: string | null;
  paymentReference: string | null;
  createdAt: string;
}

function formatSek(ore: number) {
  return (ore / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, { bar: string; badge: string; label: string }> = {
  paid:            { bar: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200",   label: "Paid" },
  pending:         { bar: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200",   label: "Pending" },
  overdue:         { bar: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200",         label: "Overdue" },
  waived:          { bar: "bg-slate-300",  badge: "bg-slate-50 text-slate-600 border-slate-200",   label: "Waived" },
  payment_pending: { bar: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200",      label: "Awaiting confirmation" },
};

function PaymentForm({
  fee,
  onSuccess,
  onCancel,
}: {
  fee: Fee;
  onSuccess: (updated: Fee) => void;
  onCancel: () => void;
}) {
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/portal/fees/${fee.id}/payment-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ paymentReference: ref.trim() }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }
      const updated = await res.json();
      onSuccess(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-secondary/10">
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Enter your payment reference number (e.g. Swish reference, bank transfer ID, or any identifier from your bank).
        The school will verify and confirm once payment is received.
      </p>
      <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`ref-${fee.id}`} className="text-xs">Payment reference</Label>
          <Input
            id={`ref-${fee.id}`}
            value={ref}
            onChange={e => setRef(e.target.value)}
            placeholder="e.g. 9876543210 or REF-2026-0501"
            required
            autoFocus
            className="text-sm font-mono"
          />
        </div>
        <Button type="submit" size="sm" disabled={submitting || !ref.trim()} className="shrink-0">
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} className="mr-1.5" />Submit</>}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="shrink-0 px-2">
          <X size={14} />
        </Button>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </form>
  );
}

function PaymentMethods() {
  return (
    <div className="rounded-xl border border-secondary/30 bg-card overflow-hidden">
      <div className="bg-secondary/10 px-5 py-3 border-b border-secondary/20">
        <p className="text-xs uppercase tracking-widest text-secondary font-semibold">How to Pay</p>
      </div>
      <div className="divide-y divide-secondary/10">
        {/* Swish */}
        <div className="px-5 py-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="p-2 bg-white border border-secondary/20 rounded-lg shadow-sm">
              <QRCodeSVG
                value="https://app.swish.nu/1/p/sw/?sw=0764505117&edit=0"
                size={120}
                fgColor="#3D0A0C"
                bgColor="#ffffff"
                level="M"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Scan with Swish app</p>
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#00B9F1] flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">S</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Swish</p>
            </div>
            <p className="text-2xl font-mono font-bold text-primary tracking-wide mb-1">0764 505 117</p>
            <p className="text-xs text-muted-foreground">Kala Kendra Sweden</p>
            <p className="text-xs text-muted-foreground mt-2">Monthly fee: <span className="font-semibold text-foreground">400 SEK</span></p>
          </div>
        </div>
        {/* Card */}
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCard size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Card Payment</p>
            <p className="text-xs text-muted-foreground">Pay securely online by card — coming soon</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest border border-secondary/30 text-muted-foreground px-2 py-0.5 rounded shrink-0">
            Soon
          </span>
        </div>
      </div>
      <div className="px-5 py-3 bg-amber-50/50 border-t border-amber-100">
        <p className="text-[11px] text-amber-800 leading-relaxed">
          After paying by Swish, use the <strong>"Mark as paid"</strong> button on the fee below and enter your Swish reference number so the school can confirm.
        </p>
      </div>
    </div>
  );
}

export default function PortalFees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/portal/fees`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { setFees(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? fees : fees.filter(f => f.status === filter);
  const totalOwed = fees
    .filter(f => f.status === "pending" || f.status === "overdue")
    .reduce((s, f) => s + f.amountOre, 0);
  const totalPaid = fees
    .filter(f => f.status === "paid")
    .reduce((s, f) => s + f.amountOre, 0);

  const handlePaymentSuccess = (updated: Fee) => {
    setFees(prev => prev.map(f => f.id === updated.id ? updated : f));
    setActiveForm(null);
  };

  const canRequestPayment = (f: Fee) =>
    (f.status === "pending" || f.status === "overdue");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-primary mb-1">Fees</h1>
        <p className="text-muted-foreground text-sm">Your fee history and outstanding payments</p>
      </div>

      {/* Payment methods */}
      <PaymentMethods />

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
        {["all", "pending", "overdue", "payment_pending", "paid"].map(s => (
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
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="mx-auto mb-4 text-muted-foreground/40" size={40} />
          <p className="text-muted-foreground text-sm">
            No fees {filter !== "all" ? `with status "${STATUS_STYLE[filter]?.label ?? filter}"` : "recorded yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => {
            const st = STATUS_STYLE[f.status] ?? STATUS_STYLE["pending"];
            const showForm = activeForm === f.id;
            return (
              <div key={f.id} className="rounded-xl border border-secondary/20 bg-card overflow-hidden">
                <div className={`h-1 ${st.bar}`} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium">{f.description}</p>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded border ${st.badge}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                        {f.dueDate && <span>Due {formatDate(f.dueDate)}</span>}
                        {f.paidDate && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 size={12} /> Paid {formatDate(f.paidDate)}
                          </span>
                        )}
                        {f.status === "payment_pending" && f.paymentReference && (
                          <span className="flex items-center gap-1 text-blue-600">
                            Ref: <code className="font-mono">{f.paymentReference}</code>
                          </span>
                        )}
                      </div>
                      {f.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{f.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-base font-semibold tabular-nums">{formatSek(f.amountOre)}</p>
                      {canRequestPayment(f) && !showForm && (
                        <button
                          onClick={() => setActiveForm(f.id)}
                          className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
                        >
                          <Send size={11} /> Mark as paid
                        </button>
                      )}
                      {f.status === "payment_pending" && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <Loader2 size={11} className="animate-spin" /> Awaiting confirmation
                        </span>
                      )}
                    </div>
                  </div>

                  {showForm && (
                    <PaymentForm
                      fee={f}
                      onSuccess={handlePaymentSuccess}
                      onCancel={() => setActiveForm(null)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pb-4">
        Payments are confirmed by the school after verification. For queries, contact us directly.
      </p>
    </div>
  );
}
