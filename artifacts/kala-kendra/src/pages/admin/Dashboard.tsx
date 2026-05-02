import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });

  if (isLoading || !stats) {
    return (
      <div className="space-y-8 animate-in fade-in">
        <h2 className="text-3xl font-serif text-primary">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="rounded-none border-secondary/20 bg-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 bg-secondary/20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16 bg-secondary/20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatProgramme = (p: string) => p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-primary">Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {stats.totalStudents} total</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Pending Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.pendingAdmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">Require review</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.activeBatches}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all programmes</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Unread Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-primary">{stats.unreadEnquiries}</div>
            <p className="text-xs text-muted-foreground mt-1">Contact form submissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="col-span-2 rounded-none border-secondary/20 bg-card">
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
                    <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs">Applicant</TableHead>
                    <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs">Programme</TableHead>
                    <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentAdmissions.map((admission) => (
                    <TableRow key={admission.id} className="border-secondary/10 hover:bg-secondary/5">
                      <TableCell>
                        <Link href={`/admin/admissions/${admission.id}`} className="font-medium hover:text-primary hover:underline underline-offset-4">
                          {admission.applicantName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatProgramme(admission.programme)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize
                          ${admission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${admission.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                          ${admission.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {admission.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-secondary/20 bg-card">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Demand by Programme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.admissionsByProgramme.map(item => (
                <div key={item.programme} className="flex justify-between items-center border-b border-secondary/10 pb-2 last:border-0">
                  <span className="text-sm font-medium">{formatProgramme(item.programme)}</span>
                  <span className="font-serif text-primary text-lg">{item.count}</span>
                </div>
              ))}
              {stats.admissionsByProgramme.length === 0 && (
                <p className="text-muted-foreground text-sm py-4">No data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
