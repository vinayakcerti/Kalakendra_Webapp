import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { useGetBatch, getGetBatchQueryKey } from "@workspace/api-client-react";
import type { BatchStudentSummary } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Users, TrendingUp, CreditCard } from "lucide-react";

function formatSek(amountOre: number): string {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(amountOre / 100);
}

function AttendanceDot({ rate }: { rate: number | null | undefined }) {
  if (rate == null) return <span className="text-xs text-muted-foreground">—</span>;
  const color = rate >= 75 ? "text-emerald-700" : rate >= 50 ? "text-amber-700" : "text-red-700";
  return <span className={`text-sm font-medium ${color}`}>{rate}%</span>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-800 border-emerald-200",
    inactive: "bg-amber-50 text-amber-800 border-amber-200",
    withdrawn: "bg-red-50 text-red-800 border-red-200",
  };
  return (
    <Badge variant="outline" className={`rounded-none text-xs border ${styles[status] ?? ""}`}>
      {status}
    </Badge>
  );
}

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: batch, isLoading, isError } = useGetBatch(id, {
    query: { queryKey: getGetBatchQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Skeleton className="h-8 w-48 bg-secondary/10" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 bg-secondary/10" />)}
        </div>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl font-serif text-primary mb-2">Batch not found</p>
        <Link href="/admin/batches">
          <Button variant="outline" className="rounded-none mt-4">Back to Batches</Button>
        </Link>
      </div>
    );
  }

  const students = batch.students ?? [];
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const totalOutstanding = students.reduce((sum, s) => sum + (s.feesOutstandingOre ?? 0), 0);
  const attendingStudents = students.filter((s) => (s.attendanceRate ?? 0) >= 75).length;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Back + Header */}
      <div>
        <Link href="/admin/batches">
          <Button variant="ghost" size="sm" className="rounded-none text-muted-foreground hover:text-primary -ml-2 mb-3 gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            All Batches
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif text-primary">{batch.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              {batch.ageRange && (
                <span className="text-xs text-secondary uppercase tracking-widest">{batch.ageRange}</span>
              )}
              {batch.schedule && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-secondary shrink-0" />
                  {batch.schedule}
                </span>
              )}
              {batch.maxStudents != null && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-secondary shrink-0" />
                  Capacity: {batch.maxStudents}
                </span>
              )}
            </div>
            {batch.description && (
              <p className="text-muted-foreground mt-2 text-sm">{batch.description}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`rounded-none text-xs mt-1 border ${batch.active ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}
          >
            {batch.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-card border border-secondary/20 px-5 py-3 flex items-center gap-3">
          <Users className="h-4 w-4 text-secondary shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Students</p>
            <p className="text-2xl font-serif text-primary">{activeStudents} <span className="text-base text-muted-foreground font-sans">of {totalStudents}</span></p>
          </div>
        </div>
        {totalStudents > 0 && (
          <div className="bg-card border border-secondary/20 px-5 py-3 flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-secondary shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">≥75% Attendance</p>
              <p className="text-2xl font-serif text-primary">{attendingStudents} <span className="text-base text-muted-foreground font-sans">of {totalStudents}</span></p>
            </div>
          </div>
        )}
        {totalOutstanding > 0 && (
          <div className="bg-card border border-secondary/20 px-5 py-3 flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-secondary shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Outstanding Fees</p>
              <p className="text-2xl font-serif text-primary">{formatSek(totalOutstanding)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Student table */}
      {students.length === 0 ? (
        <div className="bg-card border border-secondary/20 py-20 text-center">
          <p className="text-2xl font-serif text-primary mb-2">No students yet</p>
          <p className="text-muted-foreground text-sm">Enrol students from the Admissions page to add them to this batch.</p>
        </div>
      ) : (
        <div className="bg-card border border-secondary/20">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-2 border-b border-secondary/10 text-xs uppercase tracking-widest text-muted-foreground">
            <span>Student</span>
            <span className="text-right w-28">Attendance</span>
            <span className="text-right w-28">Outstanding</span>
            <span className="w-20"></span>
          </div>
          <div className="divide-y divide-secondary/10">
            {(students as BatchStudentSummary[]).map((student) => (
              <div key={student.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 items-center hover:bg-secondary/5 transition-colors">
                {/* Name + enrolled date */}
                <div>
                  <Link href={`/admin/students/${student.id}`}>
                    <span className="font-medium text-primary hover:underline underline-offset-4 cursor-pointer">
                      {student.fullName}
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={student.status} />
                    <span className="text-xs text-muted-foreground">
                      Enrolled {format(new Date(student.enrolledAt), "d MMM yyyy")}
                    </span>
                  </div>
                </div>

                {/* Attendance rate */}
                <div className="text-right w-28">
                  <AttendanceDot rate={student.attendanceRate} />
                  {student.totalSessions > 0 && (
                    <p className="text-xs text-muted-foreground">{student.totalSessions} sessions</p>
                  )}
                </div>

                {/* Outstanding fees */}
                <div className="text-right w-28">
                  {student.feesOutstandingOre > 0 ? (
                    <span className="text-sm font-medium text-amber-700">{formatSek(student.feesOutstandingOre)}</span>
                  ) : (
                    <span className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Clear
                    </span>
                  )}
                </div>

                {/* Link */}
                <div className="w-20 flex justify-end">
                  <Link href={`/admin/students/${student.id}`}>
                    <Button size="sm" variant="ghost" className="rounded-none h-7 text-xs text-muted-foreground hover:text-primary">
                      View →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
