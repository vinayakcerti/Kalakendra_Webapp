
import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetStudent,
  useUpdateStudent,
  useDeleteStudent,
  useListBatches,
  useListFees,
  useCreateFee,
  useUpdateFee,
  useDeleteFee,
  useListAttendance,
  useUpdateAttendance,
  useListStudentNotes,
  useCreateStudentNote,
  useDeleteStudentNote,
  getGetStudentQueryKey,
  getListStudentsQueryKey,
  getListBatchesQueryKey,
  getListFeesQueryKey,
  getListAttendanceQueryKey,
  getListStudentNotesQueryKey,
} from "@workspace/api-client-react";
import type { FeeRecord, AttendanceRecord, StudentNote } from "@workspace/api-client-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Trash2, Plus, CheckCircle2, Clock, AlertCircle, MinusCircle, CalendarCheck, TrendingUp, StickyNote, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  dob: z.string().optional().or(z.literal("")),
  batchId: z.string().uuid().optional().or(z.literal("")),
  primaryContactName: z.string().optional().or(z.literal("")),
  primaryContactEmail: z.string().email("Valid email").optional().or(z.literal("")),
  primaryContactPhone: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "withdrawn"]),
});

type FormValues = z.infer<typeof formSchema>;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  inactive: "bg-amber-100 text-amber-800 border-amber-200",
  withdrawn: "bg-red-100 text-red-800 border-red-200",
};

const FEE_STATUS_CONFIG: Record<string, { label: string; badgeClass: string; Icon: React.ComponentType<{ className?: string }> }> = {
  pending:  { label: "Pending",  badgeClass: "bg-amber-50 text-amber-800 border-amber-200",    Icon: Clock },
  paid:     { label: "Paid",     badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  overdue:  { label: "Overdue",  badgeClass: "bg-red-50 text-red-800 border-red-200",           Icon: AlertCircle },
  waived:   { label: "Waived",   badgeClass: "bg-slate-100 text-slate-600 border-slate-200",     Icon: MinusCircle },
};

function formatSek(amountOre: number): string {
  const sek = amountOre / 100;
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(sek);
}

function FeeRow({
  fee,
  onMarkPaid,
  onDelete,
}: {
  fee: FeeRecord;
  onMarkPaid: () => void;
  onDelete: () => void;
}) {
  const cfg = FEE_STATUS_CONFIG[fee.status] ?? FEE_STATUS_CONFIG.pending;
  return (
    <div className="flex items-start gap-4 border-b border-secondary/10 py-4 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{fee.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1">
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
        {fee.notes && <p className="text-xs text-muted-foreground mt-1 italic">{fee.notes}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={`rounded-none text-xs border ${cfg.badgeClass}`}>
          <cfg.Icon className="h-3 w-3 mr-1" />
          {cfg.label}
        </Badge>
        {fee.status === "pending" && (
          <Button size="sm" variant="outline" onClick={onMarkPaid}
            className="rounded-none border-emerald-300 text-emerald-800 hover:bg-emerald-50 h-7 text-xs px-2">
            Mark Paid
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDelete}
          className="rounded-none text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-7 w-7 p-0">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

const ATTENDANCE_STATUS_CONFIG = {
  present: { label: "Present", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  absent:  { label: "Absent",  dot: "bg-red-500",     badge: "bg-red-50 text-red-800 border-red-200" },
  late:    { label: "Late",    dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-800 border-amber-200" },
} as const;

function AttendanceSection({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const params = { studentId };
  const { data: records = [], isLoading } = useListAttendance(params, {
    query: { queryKey: getListAttendanceQueryKey(params) },
  });

  const updateAttendance = useUpdateAttendance();

  function handleUpdate(record: AttendanceRecord, status: "present" | "absent" | "late") {
    updateAttendance.mutate(
      { id: record.id, data: { status } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey(params) }),
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : null;

  // Show most recent 20 sessions, newest first
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  return (
    <div className="mt-10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl text-primary flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-secondary" />
          Attendance
        </h3>
        <Link href="/admin/attendance">
          <Button variant="ghost" size="sm" className="rounded-none text-xs text-muted-foreground hover:text-primary p-0 h-auto">
            Record session →
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 bg-secondary/10" />)}
        </div>
      ) : total === 0 ? (
        <div className="bg-card border border-secondary/20 px-6 py-8 text-center">
          <p className="text-muted-foreground text-sm">No attendance recorded yet.</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="flex flex-wrap gap-4">
            {attendanceRate !== null && (
              <div className="bg-card border border-secondary/20 px-5 py-3 flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Attendance Rate</p>
                  <p className={`text-2xl font-serif ${attendanceRate >= 75 ? "text-emerald-700" : attendanceRate >= 50 ? "text-amber-700" : "text-red-700"}`}>
                    {attendanceRate}%
                  </p>
                </div>
              </div>
            )}
            <div className="bg-card border border-secondary/20 px-5 py-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Sessions</p>
              <p className="text-2xl font-serif text-primary">{total}</p>
            </div>
            <div className="bg-card border border-secondary/20 px-5 py-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Present</p>
              <p className="text-2xl font-serif text-emerald-700">{presentCount}</p>
            </div>
            {lateCount > 0 && (
              <div className="bg-card border border-secondary/20 px-5 py-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Late</p>
                <p className="text-2xl font-serif text-amber-700">{lateCount}</p>
              </div>
            )}
            <div className="bg-card border border-secondary/20 px-5 py-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Absent</p>
              <p className="text-2xl font-serif text-red-700">{absentCount}</p>
            </div>
          </div>

          {/* Dot-strip visual */}
          <div className="flex flex-wrap gap-1.5 py-1">
            {[...records].sort((a, b) => a.date.localeCompare(b.date)).map((r) => {
              const cfg = ATTENDANCE_STATUS_CONFIG[r.status as keyof typeof ATTENDANCE_STATUS_CONFIG] ?? ATTENDANCE_STATUS_CONFIG.present;
              return (
                <div
                  key={r.id}
                  title={`${format(new Date(r.date), "d MMM yyyy")} — ${cfg.label}`}
                  className={`h-3 w-3 rounded-full ${cfg.dot}`}
                />
              );
            })}
          </div>

          {/* Recent sessions table */}
          <div className="bg-card border border-secondary/20 divide-y divide-secondary/10">
            {sorted.map((record) => {
              const cfg = ATTENDANCE_STATUS_CONFIG[record.status as keyof typeof ATTENDANCE_STATUS_CONFIG] ?? ATTENDANCE_STATUS_CONFIG.present;
              return (
                <div key={record.id} className="flex items-center gap-4 px-5 py-2.5 hover:bg-secondary/5">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-primary">{format(new Date(record.date), "EEE d MMM yyyy")}</span>
                    {record.batchName && (
                      <span className="text-xs text-muted-foreground ml-2">· {record.batchName}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {(["present", "absent", "late"] as const).map((s) => {
                      const scfg = ATTENDANCE_STATUS_CONFIG[s];
                      const active = record.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => !active && handleUpdate(record, s)}
                          disabled={active}
                          className={`px-2 py-0.5 text-xs border rounded-none transition-colors
                            ${active ? `${scfg.badge} border-current` : "border-secondary/30 text-muted-foreground hover:border-secondary/60"}`}
                        >
                          {scfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {records.length > 20 && (
            <p className="text-xs text-muted-foreground text-center">Showing 20 most recent sessions</p>
          )}
        </>
      )}
    </div>
  );
}

function FeesSection({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [addDesc, setAddDesc] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addDue, setAddDue] = useState("");
  const [addNotes, setAddNotes] = useState("");

  const { data: fees = [], isLoading } = useListFees(studentId, {}, {
    query: { queryKey: getListFeesQueryKey(studentId) },
  });
  const createFee = useCreateFee();
  const updateFee = useUpdateFee();
  const deleteFee = useDeleteFee();

  const invalidateFees = () =>
    queryClient.invalidateQueries({ queryKey: getListFeesQueryKey(studentId) });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amountOre = Math.round(parseFloat(addAmount) * 100);
    if (!addDesc || isNaN(amountOre) || amountOre <= 0) {
      toast({ title: "Description and a valid amount are required", variant: "destructive" });
      return;
    }
    createFee.mutate(
      {
        studentId,
        data: {
          description: addDesc,
          amountOre,
          dueDate: addDue || undefined,
          notes: addNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowAdd(false);
          setAddDesc(""); setAddAmount(""); setAddDue(""); setAddNotes("");
          invalidateFees();
          toast({ title: "Fee record added" });
        },
        onError: () => toast({ title: "Failed to add fee", variant: "destructive" }),
      }
    );
  }

  function handleMarkPaid(fee: FeeRecord) {
    updateFee.mutate(
      {
        id: fee.id,
        data: { status: "paid", paidDate: new Date().toISOString().split("T")[0] },
      },
      {
        onSuccess: () => { invalidateFees(); toast({ title: "Marked as paid" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this fee record?")) return;
    deleteFee.mutate(
      { id },
      {
        onSuccess: () => { invalidateFees(); toast({ title: "Fee removed" }); },
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  }

  const totalOwed = fees
    .filter((f) => f.status === "pending" || f.status === "overdue")
    .reduce((sum, f) => sum + f.amountOre, 0);
  const totalPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.amountOre, 0);

  return (
    <section className="mt-10 bg-card border border-secondary/20 p-6">
      <div className="flex items-center justify-between mb-2 pb-4 border-b border-secondary/20">
        <h3 className="font-serif text-xl text-primary">Fees & Payments</h3>
        <Button
          size="sm"
          onClick={() => setShowAdd((v) => !v)}
          variant="outline"
          className="rounded-none border-secondary/40 text-secondary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Fee
        </Button>
      </div>

      {/* Summary chips */}
      {fees.length > 0 && (
        <div className="flex gap-4 mb-4 text-xs">
          <span className="text-muted-foreground">
            Outstanding: <strong className="text-primary">{formatSek(totalOwed)}</strong>
          </span>
          <span className="text-muted-foreground">
            Paid: <strong className="text-emerald-700">{formatSek(totalPaid)}</strong>
          </span>
        </div>
      )}

      {/* Add fee form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-secondary/5 border border-secondary/20 space-y-3">
          <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">New Fee Record</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
              <Input
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                placeholder="e.g. Term 1 2026"
                className="rounded-none border-secondary/40 bg-background focus-visible:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount (SEK) *</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="rounded-none border-secondary/40 bg-background focus-visible:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
              <Input
                type="date"
                value={addDue}
                onChange={(e) => setAddDue(e.target.value)}
                className="rounded-none border-secondary/40 bg-background focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <Input
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="Optional"
                className="rounded-none border-secondary/40 bg-background focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              disabled={createFee.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-8 text-sm px-4"
            >
              {createFee.isPending ? "Adding…" : "Add Fee"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className="rounded-none h-8 text-sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Fee list */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-14 bg-secondary/10" />)}
        </div>
      ) : fees.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4">
          No fee records yet. Click "Add Fee" to create the first one.
        </p>
      ) : (
        <div>
          {fees.map((fee) => (
            <FeeRow
              key={fee.id}
              fee={fee}
              onMarkPaid={() => handleMarkPaid(fee)}
              onDelete={() => handleDelete(fee.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const inputClass = "rounded-none border-secondary/40 focus-visible:ring-primary bg-background";

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-secondary/10 py-3 text-sm">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{value ?? <span className="text-muted-foreground/50 italic">—</span>}</span>
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useGetStudent(id, {
    query: { queryKey: getGetStudentQueryKey(id) },
  });

  const { data: batches = [] } = useListBatches({
    query: { queryKey: getListBatchesQueryKey() },
  });

  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  // dob may come from DB as ISO datetime "…T00:00:00.000Z" — truncate to "YYYY-MM-DD"
  const dobDate = student?.dob ? student.dob.slice(0, 10) : "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    resetOptions: { keepDirty: false },
    // `values` makes the form reactive to external data — auto-resets when student loads/changes
    values: student
      ? {
          fullName: student.fullName,
          dob: dobDate,
          batchId: student.batchId ?? "",
          primaryContactName: student.primaryContactName ?? "",
          primaryContactEmail: student.primaryContactEmail ?? "",
          primaryContactPhone: student.primaryContactPhone ?? "",
          status: student.status as "active" | "inactive" | "withdrawn",
        }
      : undefined,
    defaultValues: {
      fullName: "",
      dob: "",
      batchId: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      status: "active",
    },
  });

  function onSubmit(values: FormValues) {
    updateStudent.mutate(
      {
        id,
        data: {
          fullName: values.fullName,
          dob: values.dob || undefined,
          batchId: values.batchId || null,
          primaryContactName: values.primaryContactName || undefined,
          primaryContactEmail: values.primaryContactEmail || undefined,
          primaryContactPhone: values.primaryContactPhone || undefined,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          // Invalidating the query re-fetches and the `values` prop auto-resets the form
          queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          toast({ title: "Student record updated" });
        },
        onError: () =>
          toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!confirm(`Remove ${student?.fullName} from the student registry? This cannot be undone.`)) return;
    deleteStudent.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          window.history.back();
        },
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48 bg-secondary/20" />
        <div className="grid md:grid-cols-2 gap-8">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-secondary/20" />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl py-24 text-center">
        <p className="text-2xl font-serif text-primary mb-4">Student not found</p>
        <Link href="/admin/students">
          <Button variant="outline" className="rounded-none border-secondary">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/students" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-primary">{student.fullName}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge
                variant="outline"
                className={`rounded-none border capitalize text-xs px-2 py-0.5 ${STATUS_STYLES[student.status] ?? ""}`}
              >
                {student.status}
              </Badge>
              {student.batchName && (
                <span className="text-sm text-muted-foreground">
                  {student.batchName}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Enrolled {format(new Date(student.enrolledAt), "d MMM yyyy")}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-none shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Student
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: form */}
        <div className="md:col-span-2 space-y-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

              {/* Student Details */}
              <section className="bg-card border border-secondary/20 p-6">
                <h3 className="font-serif text-xl text-primary mb-6 pb-3 border-b border-secondary/20">
                  Student Details
                </h3>
                <div className="space-y-5">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input {...field} className={inputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="dob" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} className={inputClass} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={inputClass}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="batchId" render={({ field }) => {
                    // Fall back to student.batchId if the form hasn't been reset yet (values-prop delay)
                    const effectiveId = field.value || student?.batchId || "";
                    const selectedBatch = batches.find((b) => b.id === effectiveId);
                    const displayLabel = selectedBatch
                      ? `${selectedBatch.name}${selectedBatch.ageRange ? ` (${selectedBatch.ageRange})` : ""}`
                      : effectiveId
                        ? (student?.batchName ?? "Loading…")
                        : "No batch assigned";
                    return (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                        value={field.value || "__none__"}
                      >
                        <FormControl>
                          <SelectTrigger className={inputClass}>
                            <span className={field.value ? "text-foreground" : "text-muted-foreground"}>
                              {displayLabel}
                            </span>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">No batch assigned</SelectItem>
                          {batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                              {b.ageRange ? ` (${b.ageRange})` : ""}
                              {!b.active ? " — inactive" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                    );
                  }} />
                </div>
              </section>

              {/* Contact Details */}
              <section className="bg-card border border-secondary/20 p-6">
                <h3 className="font-serif text-xl text-primary mb-6 pb-3 border-b border-secondary/20">
                  Contact Details
                </h3>
                <div className="space-y-5">
                  <FormField control={form.control} name="primaryContactName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl><Input placeholder="Parent or guardian name" {...field} className={inputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="primaryContactEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} className={inputClass} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="primaryContactPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="+46…" {...field} className={inputClass} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </section>

              {/* Save */}
              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={updateStudent.isPending || !form.formState.isDirty}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8"
                >
                  {updateStudent.isPending ? "Saving…" : "Save Changes"}
                </Button>
                {form.formState.isDirty && !updateStudent.isPending && (
                  <p className="text-sm text-amber-700 font-medium">Unsaved changes</p>
                )}
                {!form.formState.isDirty && !updateStudent.isPending && (
                  <p className="text-sm text-muted-foreground">No changes</p>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Right: sidebar info */}
        <div className="space-y-6">
          {/* Record summary */}
          <div className="bg-card border border-secondary/20 p-5">
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">Record</p>
            <FieldRow label="Student ID" value={<span className="font-mono text-xs break-all">{student.id}</span>} />
            <FieldRow label="Status" value={
              <span className={`capitalize text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[student.status]?.split(" ").slice(0,2).join(" ")}`}>
                {student.status}
              </span>
            } />
            <FieldRow label="Enrolled" value={format(new Date(student.enrolledAt), "d MMM yyyy")} />
            <FieldRow label="Last updated" value={format(new Date(student.updatedAt), "d MMM yyyy")} />
          </div>

          {/* Linked admission */}
          {student.admissionId ? (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                Linked Application
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                This student was enrolled from an admission application.
              </p>
              <Link href={`/admin/admissions/${student.admissionId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border-secondary/40 text-sm w-full"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">
                Linked Application
              </p>
              <p className="text-sm text-muted-foreground italic">
                Manually enrolled — no linked application.
              </p>
            </div>
          )}

          {/* Quick contact */}
          {(student.primaryContactEmail || student.primaryContactPhone) && (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                Quick Contact
              </p>
              {student.primaryContactName && (
                <p className="text-sm font-medium text-primary mb-3">{student.primaryContactName}</p>
              )}
              {student.primaryContactEmail && (
                <a
                  href={`mailto:${student.primaryContactEmail}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2 break-all"
                >
                  ✉ {student.primaryContactEmail}
                </a>
              )}
              {student.primaryContactPhone && (
                <a
                  href={`tel:${student.primaryContactPhone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ☎ {student.primaryContactPhone}
                </a>
              )}
            </div>
          )}

          {/* Batch details */}
          {student.batchName && (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                Current Batch
              </p>
              <p className="font-serif text-lg text-primary">{student.batchName}</p>
              <Link href="/admin/batches">
                <Button variant="ghost" size="sm" className="rounded-none text-xs text-muted-foreground mt-3 p-0 h-auto hover:text-primary">
                  View all batches →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Attendance section */}
      <AttendanceSection studentId={student.id} />

      {/* Fees section — full width below grid */}
      <FeesSection studentId={student.id} />

      {/* Progress notes */}
      <NotesSection studentId={student.id} />
    </div>
  );
}

/* ─── Progress Notes Section ─────────────────────────────────────────────── */

function NotesSection({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [authorName, setAuthorName] = useState("");

  const { data: notes = [], isLoading } = useListStudentNotes(studentId, {
    query: { queryKey: getListStudentNotesQueryKey(studentId) },
  });

  const createNote = useCreateStudentNote();
  const deleteNote = useDeleteStudentNote();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    createNote.mutate(
      { studentId, data: { content, authorName: authorName.trim() || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentNotesQueryKey(studentId) });
          setDraft("");
          toast({ title: "Note saved" });
        },
        onError: () => toast({ title: "Failed to save note", variant: "destructive" }),
      }
    );
  }

  function handleDelete(noteId: string) {
    deleteNote.mutate(
      { studentId, noteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentNotesQueryKey(studentId) });
          toast({ title: "Note deleted" });
        },
        onError: () => toast({ title: "Failed to delete note", variant: "destructive" }),
      }
    );
  }

  return (
    <section className="bg-card border border-secondary/20 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <StickyNote className="h-4 w-4 text-secondary" />
        <h3 className="text-lg font-serif text-primary">Progress Notes</h3>
        {notes.length > 0 && (
          <span className="text-xs text-muted-foreground ml-1">({notes.length})</span>
        )}
      </div>

      {/* Compose */}
      <form onSubmit={handleSubmit} className="mb-8">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a progress note — observations, milestones, areas to focus on…"
          className="rounded-none resize-none border-secondary/30 focus:border-secondary bg-background mb-3 min-h-[90px]"
          rows={3}
        />
        <div className="flex items-center gap-3">
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name (optional)"
            className="rounded-none border-secondary/30 h-8 text-sm max-w-[200px]"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!draft.trim() || createNote.isPending}
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-8"
          >
            <Send className="h-3 w-3" />
            Save Note
          </Button>
        </div>
      </form>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 bg-secondary/10" />)}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">
          No notes yet. Add the first observation above.
        </p>
      ) : (
        <div className="space-y-4">
          {(notes as StudentNote[]).map((note) => (
            <div key={note.id} className="group border-l-2 border-secondary/20 pl-4 py-1">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap flex-1">{note.content}</p>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                  title="Delete note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {note.authorName && (
                  <span className="text-xs font-medium text-secondary">{note.authorName}</span>
                )}
                {note.authorName && <span className="text-secondary/30 text-xs">·</span>}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.createdAt), "d MMM yyyy 'at' HH:mm")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
