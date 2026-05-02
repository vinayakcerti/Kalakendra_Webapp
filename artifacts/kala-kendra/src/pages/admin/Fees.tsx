import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  useListAllFees,
  getListAllFeesQueryKey,
  useUpdateFee,
  useDeleteFee,
  useBulkCreateFees,
  useMarkFeesOverdue,
  useListBatches,
} from "@workspace/api-client-react";
import type { FeeWithStudent, Batch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, AlertCircle, MinusCircle, Trash2, ExternalLink, PlusCircle, RefreshCw, Download } from "lucide-react";
import { exportToCsv } from "@/lib/utils";

const FEE_STATUS_CONFIG = {
  pending: { label: "Pending",  badgeClass: "bg-amber-50 text-amber-800 border-amber-200",       Icon: Clock },
  paid:    { label: "Paid",     badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  overdue: { label: "Overdue",  badgeClass: "bg-red-50 text-red-800 border-red-200",             Icon: AlertCircle },
  waived:  { label: "Waived",   badgeClass: "bg-slate-100 text-slate-600 border-slate-200",      Icon: MinusCircle },
} as const;

function formatSek(amountOre: number): string {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(amountOre / 100);
}

interface BulkForm {
  batchId: string;
  description: string;
  amountSek: string;
  dueDate: string;
  notes: string;
}

const EMPTY_FORM: BulkForm = { batchId: "all", description: "", amountSek: "", dueDate: "", notes: "" };

export default function Fees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Bulk dialog
  const [showBulk, setShowBulk] = useState(false);
  const [bulkForm, setBulkForm] = useState<BulkForm>(EMPTY_FORM);

  const params = {
    ...(statusFilter !== "all" ? { status: statusFilter as "pending" | "paid" | "overdue" | "waived" } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data: fees = [], isLoading } = useListAllFees(params, {
    query: { queryKey: getListAllFeesQueryKey(params) },
  });
  const { data: batches = [] } = useListBatches();

  const updateFee = useUpdateFee();
  const deleteFee = useDeleteFee();
  const bulkCreate = useBulkCreateFees();
  const markOverdue = useMarkFeesOverdue();

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as unknown as { _feeSearchTimer?: ReturnType<typeof setTimeout> })._feeSearchTimer);
    (window as unknown as { _feeSearchTimer?: ReturnType<typeof setTimeout> })._feeSearchTimer = setTimeout(
      () => setDebouncedSearch(val),
      300
    );
  }

  function handleMarkPaid(fee: FeeWithStudent) {
    updateFee.mutate(
      { id: fee.id, data: { status: "paid", paidDate: new Date().toISOString().split("T")[0] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAllFeesQueryKey() });
          toast({ title: `Marked as paid — ${fee.studentName}` });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  function handleDelete(fee: FeeWithStudent) {
    if (!confirm(`Remove fee "${fee.description}" for ${fee.studentName}?`)) return;
    deleteFee.mutate(
      { id: fee.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAllFeesQueryKey() });
          toast({ title: "Fee removed" });
        },
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  }

  function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountSek = parseFloat(bulkForm.amountSek);
    if (!bulkForm.description.trim() || isNaN(amountSek) || amountSek <= 0) return;

    bulkCreate.mutate(
      {
        data: {
          ...(bulkForm.batchId !== "all" ? { batchId: bulkForm.batchId } : {}),
          description: bulkForm.description.trim(),
          amountOre: Math.round(amountSek * 100),
          ...(bulkForm.dueDate ? { dueDate: bulkForm.dueDate } : {}),
          ...(bulkForm.notes.trim() ? { notes: bulkForm.notes.trim() } : {}),
        },
      },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: getListAllFeesQueryKey() });
          const batchLabel =
            bulkForm.batchId !== "all"
              ? (batches as Batch[]).find((b) => b.id === bulkForm.batchId)?.name ?? "batch"
              : "all students";
          toast({
            title: `${res.created} fee${res.created !== 1 ? "s" : ""} created`,
            description:
              res.skipped > 0
                ? `${res.skipped} skipped (already have this fee) · ${batchLabel}`
                : batchLabel,
          });
          setShowBulk(false);
          setBulkForm(EMPTY_FORM);
        },
        onError: () => toast({ title: "Bulk create failed", variant: "destructive" }),
      }
    );
  }

  const totalOutstanding = fees
    .filter((f) => f.status === "pending" || f.status === "overdue")
    .reduce((s, f) => s + f.amountOre, 0);
  const totalPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + f.amountOre, 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-serif text-primary">Fees & Payments</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              exportToCsv(
                `kala-kendra-fees-${new Date().toISOString().split("T")[0]}.csv`,
                ["Student", "Batch", "Description", "Amount (SEK)", "Status", "Due Date", "Paid Date"],
                fees.map((f) => [
                  f.studentName,
                  f.batchName ?? "",
                  f.description,
                  (f.amountOre / 100).toFixed(2),
                  f.status,
                  f.dueDate ?? "",
                  f.paidDate ?? "",
                ])
              );
            }}
            disabled={fees.length === 0}
            className="rounded-none border-secondary/40 gap-2 text-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!confirm("Mark all pending fees past their due date as overdue?")) return;
              markOverdue.mutate(undefined, {
                onSuccess: (data) => {
                  queryClient.invalidateQueries({ queryKey: getListAllFeesQueryKey() });
                  toast({ title: `${data.updated} fee${data.updated !== 1 ? "s" : ""} marked overdue` });
                },
                onError: () => toast({ title: "Failed to mark overdue", variant: "destructive" }),
              });
            }}
            disabled={markOverdue.isPending}
            className="rounded-none border-secondary/40 gap-2 text-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${markOverdue.isPending ? "animate-spin" : ""}`} />
            Mark Overdue
          </Button>
          <Button
            onClick={() => setShowBulk(true)}
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Generate Term Fees
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      {!isLoading && fees.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="bg-card border border-secondary/20 px-5 py-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Outstanding</p>
            <p className="text-2xl font-serif text-primary">{formatSek(totalOutstanding)}</p>
          </div>
          <div className="bg-card border border-secondary/20 px-5 py-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Collected</p>
            <p className="text-2xl font-serif text-emerald-700">{formatSek(totalPaid)}</p>
          </div>
          <div className="bg-card border border-secondary/20 px-5 py-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Records</p>
            <p className="text-2xl font-serif text-primary">{fees.length}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by student name…"
          className="rounded-none border-secondary/40 bg-background focus-visible:ring-primary sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-none border-secondary/40 bg-background focus:ring-primary sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="waived">Waived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fee list */}
      <div className="bg-card border border-secondary/20">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 bg-secondary/10" />)}
          </div>
        ) : fees.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-2xl font-serif text-primary mb-2">No fee records</p>
            <p className="text-muted-foreground text-sm">
              {statusFilter !== "all" || search
                ? "No records match your filters."
                : 'Use "Generate Term Fees" to create fees for all active students.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-secondary/10">
            {fees.map((fee) => {
              const cfg = FEE_STATUS_CONFIG[fee.status as keyof typeof FEE_STATUS_CONFIG] ?? FEE_STATUS_CONFIG.pending;
              return (
                <div key={fee.id} className="flex items-start gap-4 px-6 py-4 hover:bg-secondary/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <Link href={`/admin/students/${fee.studentId}`}>
                        <span className="font-medium text-primary hover:underline underline-offset-4 cursor-pointer">
                          {fee.studentName}
                        </span>
                      </Link>
                      {fee.batchName && (
                        <span className="text-xs text-muted-foreground">· {fee.batchName}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-foreground">{fee.description}</span>
                      <span className="text-base font-serif text-primary">{formatSek(fee.amountOre)}</span>
                      {fee.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due {format(new Date(fee.dueDate), "d MMM yyyy")}
                        </span>
                      )}
                      {fee.paidDate && (
                        <span className="text-xs text-muted-foreground">
                          Paid {format(new Date(fee.paidDate), "d MMM yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <Badge variant="outline" className={`rounded-none text-xs border ${cfg.badgeClass}`}>
                      <cfg.Icon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                    {fee.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkPaid(fee)}
                        disabled={updateFee.isPending}
                        className="rounded-none border-emerald-300 text-emerald-800 hover:bg-emerald-50 h-7 text-xs px-2"
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Link href={`/admin/students/${fee.studentId}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-none h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        title="View student"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(fee)}
                      className="rounded-none text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk generate dialog */}
      <Dialog open={showBulk} onOpenChange={(open) => { setShowBulk(open); if (!open) setBulkForm(EMPTY_FORM); }}>
        <DialogContent className="rounded-none max-w-md border-secondary/30 bg-background">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">Generate Term Fees</DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              Creates a pending fee for every active student in the selected batch. Students who already have a fee with the same description are skipped.
            </p>
          </DialogHeader>

          <form onSubmit={handleBulkSubmit} className="space-y-5 pt-2">
            {/* Batch */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Batch</Label>
              <Select value={bulkForm.batchId} onValueChange={(v) => setBulkForm((f) => ({ ...f, batchId: v }))}>
                <SelectTrigger className="rounded-none border-secondary/40 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All active students</SelectItem>
                  {(batches as Batch[]).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description *</Label>
              <Input
                required
                placeholder="e.g. Term 2 2026 — Bharatanatyam"
                value={bulkForm.description}
                onChange={(e) => setBulkForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded-none border-secondary/40 focus-visible:ring-primary"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Amount (SEK) *</Label>
              <Input
                required
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 1500"
                value={bulkForm.amountSek}
                onChange={(e) => setBulkForm((f) => ({ ...f, amountSek: e.target.value }))}
                className="rounded-none border-secondary/40 focus-visible:ring-primary"
              />
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Due Date (optional)</Label>
              <Input
                type="date"
                value={bulkForm.dueDate}
                onChange={(e) => setBulkForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="rounded-none border-secondary/40 focus-visible:ring-primary"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Notes (optional)</Label>
              <Textarea
                rows={2}
                placeholder="Any additional information…"
                value={bulkForm.notes}
                onChange={(e) => setBulkForm((f) => ({ ...f, notes: e.target.value }))}
                className="rounded-none border-secondary/40 focus-visible:ring-primary resize-none"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowBulk(false); setBulkForm(EMPTY_FORM); }}
                className="rounded-none border-secondary/40"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={bulkCreate.isPending || !bulkForm.description.trim() || !bulkForm.amountSek}
                className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {bulkCreate.isPending ? "Creating…" : "Generate Fees"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
