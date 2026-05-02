import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  useListAttendance,
  getListAttendanceQueryKey,
  useRecordAttendance,
  useUpdateAttendance,
  useListBatches,
  useListStudents,
} from "@workspace/api-client-react";
import type { AttendanceRecord, Batch, Student } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, CalendarCheck, Save, Users } from "lucide-react";

type AttendanceStatus = "present" | "absent" | "late";

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; badgeClass: string; Icon: React.ElementType }> = {
  present: { label: "Present", badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  absent:  { label: "Absent",  badgeClass: "bg-red-50 text-red-800 border-red-200",             Icon: XCircle },
  late:    { label: "Late",    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",        Icon: Clock },
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

interface SessionEntry {
  studentId: string;
  status: AttendanceStatus;
  notes: string;
}

export default function Attendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // View filters
  const [viewBatchId, setViewBatchId] = useState<string>("all");
  const [viewDate, setViewDate] = useState<string>("");

  // Record session state
  const [mode, setMode] = useState<"view" | "record">("view");
  const [sessionBatchId, setSessionBatchId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>(todayStr());
  const [entries, setEntries] = useState<SessionEntry[]>([]);
  const [sessionReady, setSessionReady] = useState(false);

  const { data: batches = [] } = useListBatches();
  const { data: students = [] } = useListStudents({ status: "active" });

  const viewParams = {
    ...(viewBatchId !== "all" ? { batchId: viewBatchId } : {}),
    ...(viewDate ? { date: viewDate } : {}),
  };
  const { data: records = [], isLoading } = useListAttendance(viewParams, {
    query: { queryKey: getListAttendanceQueryKey(viewParams) },
  });

  const recordAttendance = useRecordAttendance();
  const updateAttendance = useUpdateAttendance();

  // --- Session recording helpers ---
  function initSession() {
    if (!sessionBatchId) return;
    const batchStudents = (students as Student[]).filter(
      (s) => s.batchId === sessionBatchId
    );
    setEntries(
      batchStudents.map((s) => ({ studentId: s.id, status: "present", notes: "" }))
    );
    setSessionReady(true);
  }

  function setEntryStatus(studentId: string, status: AttendanceStatus) {
    setEntries((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, status } : e))
    );
  }

  function saveSession() {
    recordAttendance.mutate(
      {
        data: {
          batchId: sessionBatchId,
          date: sessionDate,
          entries: entries.map((e) => ({ studentId: e.studentId, status: e.status })),
        },
      },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey() });
          toast({ title: `Saved ${res.saved} attendance entries` });
          setMode("view");
          setSessionReady(false);
          setEntries([]);
          setSessionBatchId("");
        },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      }
    );
  }

  function handleQuickUpdate(record: AttendanceRecord, status: AttendanceStatus) {
    updateAttendance.mutate(
      { id: record.id, data: { status } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey() }),
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  // Group records by date for display
  const grouped: Record<string, AttendanceRecord[]> = {};
  for (const r of records) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // --- Student name lookup for session recording ---
  const studentMap = Object.fromEntries((students as Student[]).map((s) => [s.id, s]));

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-serif text-primary">Attendance</h2>
        {mode === "view" ? (
          <Button
            onClick={() => setMode("record")}
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <CalendarCheck className="h-4 w-4" />
            Record Session
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => { setMode("view"); setSessionReady(false); setEntries([]); setSessionBatchId(""); }}
            className="rounded-none border-secondary/40"
          >
            Cancel
          </Button>
        )}
      </div>

      {mode === "record" ? (
        /* ── RECORD SESSION ── */
        <div className="space-y-6">
          <div className="bg-card border border-secondary/20 p-6 space-y-5">
            <h3 className="font-serif text-xl text-primary">New Session</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Batch *</Label>
                <Select
                  value={sessionBatchId}
                  onValueChange={(v) => { setSessionBatchId(v); setSessionReady(false); setEntries([]); }}
                >
                  <SelectTrigger className="rounded-none border-secondary/40 focus:ring-primary">
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {(batches as Batch[]).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Date *</Label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => { setSessionDate(e.target.value); setSessionReady(false); setEntries([]); }}
                  className="rounded-none border-secondary/40 focus-visible:ring-primary"
                />
              </div>
            </div>

            {!sessionReady && (
              <Button
                onClick={initSession}
                disabled={!sessionBatchId}
                variant="outline"
                className="rounded-none border-secondary/40 gap-2"
              >
                <Users className="h-4 w-4" />
                Load Students
              </Button>
            )}
          </div>

          {sessionReady && entries.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No active students in this batch.
            </div>
          )}

          {sessionReady && entries.length > 0 && (
            <div className="bg-card border border-secondary/20">
              <div className="px-6 py-3 border-b border-secondary/10 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {entries.length} student{entries.length !== 1 ? "s" : ""} ·{" "}
                  {format(parseISO(sessionDate), "d MMMM yyyy")}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="rounded-none text-xs h-7"
                    onClick={() => setEntries((prev) => prev.map((e) => ({ ...e, status: "present" })))}>
                    All Present
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-none text-xs h-7"
                    onClick={() => setEntries((prev) => prev.map((e) => ({ ...e, status: "absent" })))}>
                    All Absent
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-secondary/10">
                {entries.map((entry) => {
                  const student = studentMap[entry.studentId];
                  return (
                    <div key={entry.studentId} className="flex items-center gap-4 px-6 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary">{student?.fullName ?? entry.studentId}</p>
                        {student?.batchId && (
                          <p className="text-xs text-muted-foreground">{student.phone ?? ""}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        {(["present", "absent", "late"] as AttendanceStatus[]).map((s) => {
                          const cfg = STATUS_CONFIG[s];
                          const active = entry.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setEntryStatus(entry.studentId, s)}
                              className={`flex items-center gap-1 px-2.5 py-1 text-xs border transition-colors rounded-none
                                ${active ? `${cfg.badgeClass} border-current` : "border-secondary/30 text-muted-foreground hover:border-secondary/60"}`}
                            >
                              <cfg.Icon className="h-3 w-3" />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-4 border-t border-secondary/10">
                <Button
                  onClick={saveSession}
                  disabled={recordAttendance.isPending}
                  className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {recordAttendance.isPending ? "Saving…" : "Save Session"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── VIEW / HISTORY ── */
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={viewBatchId} onValueChange={setViewBatchId}>
              <SelectTrigger className="rounded-none border-secondary/40 bg-background focus:ring-primary sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All batches</SelectItem>
                {(batches as Batch[]).map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
              className="rounded-none border-secondary/40 bg-background focus-visible:ring-primary sm:w-48"
            />
            {viewDate && (
              <Button variant="ghost" onClick={() => setViewDate("")}
                className="rounded-none text-muted-foreground hover:text-primary h-9 px-3 text-xs">
                Clear date
              </Button>
            )}
          </div>

          {/* Records */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 bg-secondary/10" />)}
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="bg-card border border-secondary/20 py-20 text-center">
              <p className="text-2xl font-serif text-primary mb-2">No records yet</p>
              <p className="text-muted-foreground text-sm">
                Use "Record Session" to take attendance for a class.
              </p>
            </div>
          ) : (
            sortedDates.map((date) => {
              const dayRecords = grouped[date];
              const batchGroups: Record<string, AttendanceRecord[]> = {};
              for (const r of dayRecords) {
                if (!batchGroups[r.batchId]) batchGroups[r.batchId] = [];
                batchGroups[r.batchId].push(r);
              }
              const presentCount = dayRecords.filter((r) => r.status === "present").length;
              const absentCount = dayRecords.filter((r) => r.status === "absent").length;
              const lateCount = dayRecords.filter((r) => r.status === "late").length;

              return (
                <div key={date} className="bg-card border border-secondary/20">
                  <div className="px-6 py-3 border-b border-secondary/10 flex items-center justify-between">
                    <h3 className="font-serif text-lg text-primary">
                      {format(parseISO(date), "EEEE, d MMMM yyyy")}
                    </h3>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {presentCount > 0 && <span className="text-emerald-700">✓ {presentCount} present</span>}
                      {lateCount > 0 && <span className="text-amber-700">◷ {lateCount} late</span>}
                      {absentCount > 0 && <span className="text-red-700">✗ {absentCount} absent</span>}
                    </div>
                  </div>
                  {Object.entries(batchGroups).map(([batchId, bRecords]) => (
                    <div key={batchId}>
                      <div className="px-6 py-2 bg-secondary/5 border-b border-secondary/10">
                        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                          {bRecords[0]?.batchName}
                        </span>
                      </div>
                      <div className="divide-y divide-secondary/10">
                        {bRecords.map((record) => {
                          const cfg = STATUS_CONFIG[record.status as AttendanceStatus] ?? STATUS_CONFIG.present;
                          return (
                            <div key={record.id} className="flex items-center gap-4 px-6 py-3 hover:bg-secondary/5">
                              <span className="flex-1 font-medium text-primary text-sm">{record.studentName}</span>
                              <div className="flex gap-1.5">
                                {(["present", "absent", "late"] as AttendanceStatus[]).map((s) => {
                                  const scfg = STATUS_CONFIG[s];
                                  const active = record.status === s;
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => handleQuickUpdate(record, s)}
                                      disabled={active}
                                      className={`flex items-center gap-1 px-2 py-0.5 text-xs border rounded-none transition-colors
                                        ${active ? `${scfg.badgeClass} border-current` : "border-secondary/30 text-muted-foreground hover:border-secondary/60"}`}
                                    >
                                      <scfg.Icon className="h-3 w-3" />
                                      {scfg.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
