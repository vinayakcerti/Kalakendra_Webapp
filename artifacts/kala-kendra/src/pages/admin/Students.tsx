import { useState, useEffect } from "react";
import { useListStudents, getListStudentsQueryKey, useCreateStudent, useDeleteStudent, CreateStudentBodyProgramme } from "@workspace/api-client-react";
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
// A simple debounce implementation for the component
function useLocalDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  programme: z.nativeEnum(CreateStudentBodyProgramme),
});

export default function Students() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useLocalDebounce(search, 500);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryParams = debouncedSearch ? { search: debouncedSearch } : {};
  const { data: students, isLoading } = useListStudents(queryParams, {
    query: { queryKey: getListStudentsQueryKey(queryParams) }
  });

  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", programme: "bharatanatyam" },
  });

  const formatProgramme = (p: string) => p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createStudent.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Student added successfully" });
        setDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey(queryParams) });
      },
      onError: () => toast({ title: "Failed to add student", variant: "destructive" })
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    deleteStudent.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Student removed" });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey(queryParams) });
      }
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
          <DialogContent className="rounded-none border-secondary/40 bg-card">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">Add New Student</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="programme" render={({ field }) => (
                  <FormItem><FormLabel>Programme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="bharatanatyam">Bharatanatyam</SelectItem>
                        <SelectItem value="carnatic_vocal">Carnatic Vocal</SelectItem>
                        <SelectItem value="carnatic_instrumental">Carnatic Instrumental</SelectItem>
                        <SelectItem value="kerala_arts">Kerala Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createStudent.isPending} className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground">Save</Button>
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
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Contact</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Programme</TableHead>
              <TableHead className="font-medium text-secondary uppercase tracking-widest text-xs h-12">Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-secondary/10">
                  <TableCell><Skeleton className="h-4 w-32 bg-secondary/20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40 bg-secondary/20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-secondary/20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-secondary/20" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : students?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students found.</TableCell>
              </TableRow>
            ) : (
              students?.map((student) => (
                <TableRow key={student.id} className="border-secondary/10 hover:bg-secondary/5">
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{student.email}</div>
                    {student.phone && <div className="text-xs">{student.phone}</div>}
                  </TableCell>
                  <TableCell>
                    <div>{formatProgramme(student.programme)}</div>
                    {student.batchName && <div className="text-xs text-muted-foreground">{student.batchName}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize
                      ${student.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      ${student.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-none">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
