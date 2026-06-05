import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useListStudents,
  getListStudentsQueryKey,
  useCreateStudent,
  useDeleteStudent,
  useListBatches,
  getListBatchesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Trash2, Download, Filter, Mail, Send } from "lucide-react";
import { exportToCsv } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  dob: z.string().optional(),
  batchId: z.string().uuid().optional(),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  primaryContactPhone: z.string().optional(),
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-amber-100 text-amber-800",
  withdrawn: "bg-red-100 text-red-800",
};

export default function Students() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");

  const queryParams = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as "active" | "inactive" | "withdrawn" } : {}),
    ...(batchFilter !== "all" ? { batchId: batchFilter } : {}),
  };
  const { data: students, isLoading } = useListStudents(queryParams, {
    query: { queryKey: getListStudentsQueryKey(queryParams) },
  });

  const { data: batches } = useListBatches({}, { query: { queryKey: getListBatchesQueryKey() } });

  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      batchId: undefined,
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createStudent.mutate({ data: { fullName: values.fullName, dob: values.dob || undefined, batchId: values.batchId, primaryContactName: values.primaryContactName, primaryContactEmail: values.primaryContactEmail || undefined, primaryContactPhone: values.primaryContactPhone } }, {
      onSuccess: () => {
        toast({ title: "Student added successfully" });
        setDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey(queryParams) });
      },
      onError: () => toast({ title: "Failed to add student", variant: "destructive" }),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    deleteStudent.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Student removed" });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey(queryParams) });
      },
    });
  };

  const handleSendInvite = async (e: React.MouseEvent, studentId: string, email: string | null | undefined, name: string) => {
    e.stopPropagation();
    if (!email) {
      toast({ title: "No email on record", description: `Add an email address for ${name} first.`, variant: "destructive" });
      return;
    }
    setSendingInvite(studentId);
    try {
      const res = await fetch(`${(import.meta.env["VITE_API_URL"] ?? "")}/api/students/${studentId}/send-invite`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
      toast({ title: "Invite sent", description: `Portal invite sent to ${email}` });
    } catch (err) {
      toast({ title: "Failed to send invite", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSendingInvite(null);
    }
  };

  const handleBulkInvite = async () => {
    const withEmail = (students ?? []).filter(s => s.primaryContactEmail);
    if (withEmail.length === 0) {
      toast({ title: "No students with email addresses", description: "Add emails to students before sending invites.", variant: "destructive" });
      return;
    }
    if (!confirm(`Send portal invites to all ${withEmail.length} active students with email addresses?`)) return;
    setBulkSending(true);
    try {
      const res = await fetch(`${(import.meta.env["VITE_API_URL"] ?? "")}/api/students/send-invites-bulk`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { sent: number; failed: number; total: number };
      toast({ title: `Invites sent to ${data.sent} student${data.sent !== 1 ? "s" : ""}`, description: data.failed > 0 ? `${data.failed} failed — check logs.` : "All emails delivered successfully." });
    } catch {
      toast({ title: "Bulk invite failed", variant: "destructive" });
    } finally {
      setBulkSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-serif text-primary">Students</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleBulkInvite}
            disabled={bulkSending || isLoading}
            className="rounded-none border-secondary/40 gap-2 text-sm"
          >
            <Send className="h-3.5 w-3.5" />
            {bulkSending ? "Sending…" : "Invite All to Portal"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              exportToCsv(
                `kala-kendra-students-${new Date().toISOString().split("T")[0]}.csv`,
                ["Name", "Batch", "Status", "Enrolled", "Contact Name", "Contact Email", "Contact Phone"],
                (students ?? []).map((s) => [
                  s.fullName,
                  s.batchName ?? "",
                  s.status,
                  s.enrolledAt ? new Date(s.enrolledAt).toISOString().split("T")[0] : "",
                  s.primaryContactName ?? "",
                  s.primaryContactEmail ?? "",
                  s.primaryContactPhone ?? "",
                ])
              );
            }}
            disabled={!students || students.length === 0}
            className="rounded-none border-secondary/40 gap-2 text-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-secondary/40 bg-card max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">Add New Student</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dob" render={({ field }) => (
                    <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="batchId" render={({ field }) => (
                    <FormItem><FormLabel>Batch</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl><SelectTrigger className="rounded-none"><SelectValue placeholder="Select batch" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {batches?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="primaryContactName" render={({ field }) => (
                  <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="primaryContactEmail" render={({ field }) => (
                    <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="primaryContactPhone" render={({ field }) => (
                    <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createStudent.isPending} className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground">
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-none border-secondary/40 bg-card w-64"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-none border-secondary/40 bg-card w-40">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="rounded-none border-secondary/40 bg-card w-52">
            <SelectValue placeholder="All batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All batches</SelectItem>
            {batches?.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-secondary/20 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-secondary/20">
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Name</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Batch</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Contact</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Enrolled</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-secondary/10">
                    {[32, 24, 40, 24, 20, 8].map((w, j) => (
                      <TableCell key={j}><Skeleton className={`h-4 w-${w} bg-secondary/20`} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : students?.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students found.</TableCell>
                </TableRow>
              )
              : students?.map((student) => (
                  <TableRow
                    key={student.id}
                    className="border-secondary/10 hover:bg-secondary/5 cursor-pointer"
                    onClick={() => navigate(`/admin/students/${student.id}`)}
                  >
                    <TableCell className="font-medium">{student.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{student.batchName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{student.primaryContactEmail ?? "—"}</div>
                      {student.primaryContactPhone && <div className="text-xs">{student.primaryContactPhone}</div>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(student.enrolledAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize ${STATUS_STYLES[student.status] ?? ""}`}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={student.primaryContactEmail ? `Send portal invite to ${student.primaryContactEmail}` : "No email — add one first"}
                          onClick={(e) => handleSendInvite(e, student.id, student.primaryContactEmail, student.fullName)}
                          disabled={sendingInvite === student.id}
                          className={`rounded-none ${student.primaryContactEmail ? "text-muted-foreground hover:text-primary hover:bg-primary/10" : "text-muted-foreground/30 cursor-default"}`}
                        >
                          {sendingInvite === student.id
                            ? <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                            : <Mail className="h-4 w-4" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
