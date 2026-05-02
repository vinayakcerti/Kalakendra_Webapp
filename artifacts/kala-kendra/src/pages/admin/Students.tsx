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
import { Search, Plus, Trash2 } from "lucide-react";

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

  const queryParams = debouncedSearch ? { search: debouncedSearch } : {};
  const { data: students, isLoading } = useListStudents(queryParams, {
    query: { queryKey: getListStudentsQueryKey(queryParams) },
  });

  const { data: batches } = useListBatches({ query: { queryKey: getListBatchesQueryKey() } });

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

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-serif text-primary">Students</h2>
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

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-none border-secondary/40 bg-card"
        />
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
