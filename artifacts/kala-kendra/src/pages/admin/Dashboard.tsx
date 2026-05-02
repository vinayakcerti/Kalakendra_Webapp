import { useGetDashboardStats, getGetDashboardStatsQueryKey, useListActivity, getListActivityQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import {
  FileText,
  CreditCard,
  AlertCircle,
  StickyNote,
  MessageSquare,
  CalendarCheck,
  UserPlus,
} from "lucide-react";

function formatSek(amountOre: number): string {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(amountOre / 100);
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  accepted: "bg-emerald-100 text-emerald-800",
  waitlisted: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  admission: { icon: FileText, color: "text-blue-700", bg: "bg-blue-50" },
  fee_paid: { icon: CreditCard, color: "text-emerald-700", bg: "bg-emerald-50" },
  fee_overdue: { icon: AlertCircle, color: "text-red-700", bg: "bg-red-50" },
  note: { icon: StickyNote, color: "text-amber-700", bg: "bg-amber-50" },
  enquiry: { icon: MessageSquare, color: "text-violet-700", bg: "bg-violet-50" },
  attendance: { icon: CalendarCheck, color: "text-teal-700", bg: "bg-teal-50" },
  student_enrolled: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  const { data: activity, isLoading: activityLoading } = useListActivity(
    { limit: 25 },
    { query: { queryKey: getListActivityQueryKey({ limit: 25 }) } },
  );

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

      {/* Stat cards */}
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
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Outstanding Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{formatSek(stats.totalOutstandingOre)}</div>
            <Link href="/admin/fees">
              <p className="text-xs text-muted-foreground mt-1 hover:text-primary transition-colors cursor-pointer">
                {stats.overdueCount > 0
                  ? `${stats.overdueCount} overdue · view all →`
                  : "View all fees →"}
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout: Recent Admissions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Admissions — spans 3 cols */}
        <Card className="rounded-none border-secondary/20 bg-card lg:col-span-3">
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

        {/* Activity Feed — spans 2 cols */}
        <Card className="rounded-none border-secondary/20 bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activityLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <Skeleton className="h-8 w-8 rounded-full bg-secondary/20 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4 bg-secondary/20" />
                      <Skeleton className="h-3 w-1/2 bg-secondary/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !activity || activity.length === 0 ? (
              <p className="text-muted-foreground text-sm py-6 px-6">No recent activity.</p>
            ) : (
              <div className="divide-y divide-secondary/10 max-h-[460px] overflow-y-auto">
                {activity.map((item) => {
                  const cfg = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.admission;
                  const Icon = cfg.icon;
                  const content = (
                    <div className="flex gap-3 items-start px-6 py-3.5 hover:bg-secondary/5 transition-colors">
                      <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${cfg.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug truncate">{item.title}</p>
                        {item.detail && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                        )}
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <Link key={item.id} href={item.href} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={item.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
