import { useState } from "react";
import {
  useListBatches,
  getListBatchesQueryKey,
  useUpdateBatch,
} from "@workspace/api-client-react";
import type { Batch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Check, X, Clock, Users, CalendarDays } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];

const DAY_MAP: Record<string, Day> = {
  monday: "Mon", mon: "Mon",
  tuesday: "Tue", tue: "Tue",
  wednesday: "Wed", wed: "Wed",
  thursday: "Thu", thu: "Thu",
  friday: "Fri", fri: "Fri",
  saturday: "Sat", sat: "Sat",
  sunday: "Sun", sun: "Sun",
};

function parseDays(schedule: string | null | undefined): Day[] {
  if (!schedule) return [];
  const lower = schedule.toLowerCase();
  return DAYS.filter((d) => {
    const key = d.toLowerCase();
    return DAY_MAP[key] && lower.includes(key.slice(0, 3));
  });
}

function DayPills({ schedule }: { schedule: string | null | undefined }) {
  const active = parseDays(schedule);
  if (active.length === 0) return null;
  return (
    <div className="flex gap-1 flex-wrap mt-2">
      {DAYS.map((d) => (
        <span
          key={d}
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm transition-colors ${
            active.includes(d)
              ? "bg-secondary text-secondary-foreground"
              : "bg-secondary/10 text-muted-foreground"
          }`}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

function ScheduleRow({ batch }: { batch: Batch }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(batch.schedule ?? "");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateBatch = useUpdateBatch();

  const handleSave = () => {
    updateBatch.mutate(
      { id: batch.id, data: { schedule: value || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Schedule updated" });
          setEditing(false);
          queryClient.invalidateQueries({ queryKey: getListBatchesQueryKey() });
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  };

  const handleCancel = () => {
    setValue(batch.schedule ?? "");
    setEditing(false);
  };

  return (
    <div className="border border-secondary/20 bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-lg text-primary leading-tight">{batch.name}</p>
          {batch.ageRange && (
            <p className="text-[11px] uppercase tracking-widest text-secondary mt-0.5">{batch.ageRange}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className={`rounded-none text-[10px] border ${
              batch.active
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-stone-100 text-stone-500 border-stone-200"
            }`}
          >
            {batch.active ? "Active" : "Inactive"}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {batch.studentCount}
          </span>
        </div>
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-secondary shrink-0" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Tuesday & Thursday, 5:00 – 6:30 PM"
            className="rounded-none h-8 text-sm flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={updateBatch.isPending}
            className="h-8 w-8 rounded-none text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-start gap-2 group/row">
          <Clock className="h-3.5 w-3.5 text-secondary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {batch.schedule ? (
              <p className="text-sm text-foreground">{batch.schedule}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No schedule set</p>
            )}
            <DayPills schedule={batch.schedule} />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => { setValue(batch.schedule ?? ""); setEditing(true); }}
            className="h-7 w-7 rounded-none opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Schedule() {
  const { data: batches, isLoading } = useListBatches(
    {},
    { query: { queryKey: getListBatchesQueryKey() } },
  );

  const sorted = batches?.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const withSchedule = sorted?.filter((b) => b.schedule && b.schedule !== "Schedule on application") ?? [];
  const withoutSchedule = sorted?.filter((b) => !b.schedule || b.schedule === "Schedule on application") ?? [];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-primary">Class Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set and manage timing for each batch. Hover a row to edit the schedule inline.
          </p>
        </div>
        <CalendarDays className="h-6 w-6 text-secondary" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-secondary/20 bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-40 bg-secondary/15" />
              <Skeleton className="h-4 w-64 bg-secondary/10" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {withSchedule.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold">Scheduled</p>
              <div className="grid md:grid-cols-2 gap-4">
                {withSchedule.map((batch) => (
                  <ScheduleRow key={batch.id} batch={batch} />
                ))}
              </div>
            </section>
          )}

          {withoutSchedule.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
                {withSchedule.length > 0 ? "Not Yet Scheduled" : "All Batches"}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {withoutSchedule.map((batch) => (
                  <ScheduleRow key={batch.id} batch={batch} />
                ))}
              </div>
            </section>
          )}

          {sorted?.length === 0 && (
            <div className="text-center py-20 border border-secondary/20 bg-card">
              <p className="font-serif text-2xl text-primary mb-2">No batches yet</p>
              <p className="text-muted-foreground text-sm">Create batches first from the Batches page.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
