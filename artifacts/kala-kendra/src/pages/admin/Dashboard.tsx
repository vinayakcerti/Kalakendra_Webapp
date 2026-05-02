import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  accepted: "bg-emerald-100 text-emerald-800",
  waitlisted: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-8 animate-in fade-in">
        <h2 className="text-3xl font-serif text-primary">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-none border-secondary/20 bg-card">
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24 bg-secondary/20" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-16 bg-secondary/20" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-serif text-primary">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">of {stats.totalStudents} total</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.pendingAdmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.underReviewAdmissions} under review</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.activeBatches}</div>
            <p className="text-xs text-muted-foreground mt-1">of {stats.totalBatches} total</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Unread Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.unreadEnquiries}</div>
            <p className="text-xs text-muted-foreground mt-1">Contact form submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-secondary/20 bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-primary">Recent Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentAdmissions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No recent admissions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-secondary/20 hover:bg-transparent">
                  <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs">Student</TableHead>
                  <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs">Batch</TableHead>
                  <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs">Applied</TableHead>
                  <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentAdmissions.map((admission) => (
                  <TableRow key={admission.id} className="border-secondary/10 hover:bg-secondary/5">
                    <TableCell>
                      <Link
                        href={`/admin/admissions/${admission.id}`}
                        className="font-medium hover:text-primary hover:underline underline-offset-4"
                      >
                        {admission.studentName}
                      </Link>
                      <div className="text-xs text-muted-foreground capitalize">{admission.applicantType}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{admission.batch}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(admission.submittedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize ${STATUS_STYLES[admission.status] ?? ""}`}>
                        {admission.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
