import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListAdmissions, getListAdmissionsQueryKey, ListAdmissionsStatus } from "@workspace/api-client-react";
import { format } from "date-fns";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admissions() {
  const [statusFilter, setStatusFilter] = useState<ListAdmissionsStatus | "all">("all");
  const [, setLocation] = useLocation();

  const queryParams = statusFilter === "all" ? {} : { status: statusFilter };
  const { data: admissions, isLoading } = useListAdmissions(queryParams, { 
    query: { queryKey: getListAdmissionsQueryKey(queryParams) } 
  });

  const formatProgramme = (p: string) => p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-primary">Admissions</h2>
      </div>

      <Tabs defaultValue="all" value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
        <TabsList className="bg-card border border-secondary/20 rounded-none h-12 p-1">
          <TabsTrigger value="all" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif text-lg">All</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif text-lg">Pending</TabsTrigger>
          <TabsTrigger value="reviewed" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif text-lg">Reviewed</TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif text-lg">Accepted</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-serif text-lg">Rejected</TabsTrigger>
        </TabsList>

        <div className="mt-6 border border-secondary/20 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-secondary/20 hover:bg-transparent">
                <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Applicant</TableHead>
                <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Programme</TableHead>
                <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Age Group</TableHead>
                <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Applied On</TableHead>
                <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-secondary/10">
                    <TableCell><Skeleton className="h-4 w-32 bg-secondary/20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-secondary/20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-secondary/20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-secondary/20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-secondary/20" /></TableCell>
                  </TableRow>
                ))
              ) : admissions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No admissions found matching this status.
                  </TableCell>
                </TableRow>
              ) : (
                admissions?.map((admission) => (
                  <TableRow 
                    key={admission.id} 
                    className="border-secondary/10 hover:bg-secondary/5 cursor-pointer"
                    onClick={() => setLocation(`/admin/admissions/${admission.id}`)}
                  >
                    <TableCell className="font-medium">{admission.applicantName}</TableCell>
                    <TableCell className="text-muted-foreground">{formatProgramme(admission.programme)}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{admission.ageGroup}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(admission.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize
                        ${admission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${admission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${admission.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                        ${admission.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {admission.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>
    </div>
  );
}
