import { format, formatDistanceToNow } from "date-fns";
import { useListReminderRuns, getListReminderRunsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { BellRing, RefreshCw, Clock, CheckCircle2, XCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

type Run = {
  id: number;
  triggeredBy: string;
  markedCount: number;
  remindedCount: number;
  failedCount: number;
  ranAt: string;
};

function triggerLabel(t: string) {
  if (t === "scheduled") return { label: "Scheduled", color: "bg-secondary/20 text-secondary border-secondary/30" };
  if (t === "manual_mark_overdue") return { label: "Manual — Mark Overdue", color: "bg-amber-100 text-amber-800 border-amber-300" };
  if (t === "manual_remind_all") return { label: "Manual — Send All", color: "bg-blue-100 text-blue-800 border-blue-300" };
  return { label: t, color: "bg-muted text-muted-foreground border-border" };
}

function RunRow({ run }: { run: Run }) {
  const { label, color } = triggerLabel(run.triggeredBy);
  const ranAt = new Date(run.ranAt);
  const noAction = run.markedCount === 0 && run.remindedCount === 0;

  return (
    <div className={`border-b border-secondary/10 py-5 px-6 flex flex-col sm:flex-row sm:items-center gap-3 ${noAction ? "opacity-60" : ""}`}>
      {/* Left: icon + time */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${noAction ? "bg-secondary/10" : "bg-primary/10"}`}>
          <BellRing className={`w-4 h-4 ${noAction ? "text-secondary" : "text-primary"}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {noAction
              ? "No overdue fees found"
              : `${run.markedCount > 0 ? `${run.markedCount} marked overdue` : ""}${run.markedCount > 0 && run.remindedCount > 0 ? " · " : ""}${run.remindedCount > 0 ? `${run.remindedCount} reminded` : ""}`
            }
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span title={format(ranAt, "d MMM yyyy HH:mm:ss")}>
              {formatDistanceToNow(ranAt, { addSuffix: true })}
            </span>
            <span className="text-secondary/40 mx-1">·</span>
            <span className="font-mono">{format(ranAt, "d MMM yyyy, HH:mm")}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm shrink-0">
        {run.markedCount > 0 && (
          <span className="flex items-center gap-1 text-amber-700">
            <RefreshCw className="w-3.5 h-3.5" />
            {run.markedCount} marked
          </span>
        )}
        {run.remindedCount > 0 && (
          <span className="flex items-center gap-1 text-green-700">
            <MailCheck className="w-3.5 h-3.5" />
            {run.remindedCount} emailed
          </span>
        )}
        {run.failedCount > 0 && (
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="w-3.5 h-3.5" />
            {run.failedCount} failed
          </span>
        )}
        {noAction && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Nothing to do
          </span>
        )}
      </div>

      {/* Trigger badge */}
      <div className="shrink-0">
        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-sm ${color}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function ActivityLog() {
  const queryClient = useQueryClient();
  const { data: runs = [], isLoading, isFetching } = useListReminderRuns(
    { limit: 100 },
    { query: { queryKey: getListReminderRunsQueryKey({ limit: 100 }) } }
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            History of automated and manual fee reminder job runs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none border-secondary/40 gap-2 shrink-0"
          onClick={() => queryClient.invalidateQueries({ queryKey: getListReminderRunsQueryKey({ limit: 100 }) })}
          disabled={isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "Scheduled", color: "bg-secondary/20 text-secondary border-secondary/30" },
          { label: "Manual — Mark Overdue", color: "bg-amber-100 text-amber-800 border-amber-300" },
          { label: "Manual — Send All", color: "bg-blue-100 text-blue-800 border-blue-300" },
        ].map(({ label, color }) => (
          <span key={label} className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border rounded-sm ${color}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="border border-secondary/20 bg-card">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Loading…</div>
        ) : runs.length === 0 ? (
          <div className="py-16 text-center">
            <BellRing className="w-8 h-8 text-secondary/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No job runs recorded yet.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Runs will appear here once the daily job fires or you trigger one manually from the Fees page.
            </p>
          </div>
        ) : (
          <div>
            <div className="px-6 py-3 border-b border-secondary/20 bg-secondary/5 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
                {runs.length} run{runs.length !== 1 ? "s" : ""} recorded
              </p>
              <p className="text-xs text-muted-foreground">Most recent first</p>
            </div>
            {runs.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
