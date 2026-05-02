import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListAdmissions, getListAdmissionsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Status = "all" | "pending" | "under_review" | "accepted" | "waitlisted" | "rejected";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  accepted: "bg-emerald-100 text-emerald-800",
  waitlisted: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

export default function Admissions() {
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const queryParams =
    statusFilter === "all"
      ? search ? { search } : {}
      : search ? { status: statusFilter, search } : { status: statusFilter };

  const { data: admissions, isLoading } = useListAdmissions(queryParams as Parameters<typeof useListAdmissions>[0], {
    query: { queryKey: getListAdmissionsQueryKey(queryParams as Parameters<typeof useListAdmissions>[0]) },
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-primary">Admissions</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status)}>
          <TabsList className="bg-card border border-secondary/20 rounded-none h-11 p-1 flex-wrap">
            {(["all", "pending", "under_review", "accepted", "waitlisted", "rejected"] as Status[]).map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium capitalize text-sm"
              >
                {s.replace("_", " ")}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 max-w-xs w-full sm:w-auto">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-none border-secondary/40 bg-card h-9"
          />
        </div>
      </div>

      <div className="border border-secondary/20 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-secondary/20 hover:bg-transparent">
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Student</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Type</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Batch</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Submitted</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i} className="border-secondary/10">
                      {[32, 16, 20, 24, 20].map((w, j) => (
                        <TableCell key={j}><Skeleton className={`h-4 w-${w} bg-secondary/20`} /></TableCell>
                      ))}
                    </TableRow>
                  ))
              : admissions?.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No admissions found.
                  </TableCell>
                </TableRow>
              )
              : admissions?.map((admission) => (
                  <TableRow
                    key={admission.id}
                    className="border-secondary/10 hover:bg-secondary/5 cursor-pointer"
                    onClick={() => setLocation(`/admin/admissions/${admission.id}`)}
                  >
                    <TableCell className="font-medium">{admission.studentName}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{admission.applicantType}</TableCell>
                    <TableCell className="text-muted-foreground">{admission.batch}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(admission.submittedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-none border-secondary/40 capitalize ${STATUS_STYLES[admission.status] ?? ""}`}
                      >
                        {admission.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
