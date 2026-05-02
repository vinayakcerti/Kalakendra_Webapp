import { useState } from "react";
import { useListBatches, getListBatchesQueryKey, useCreateBatch, useDeleteBatch, CreateBatchBodyProgramme } from "@workspace/api-client-react";
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
import { Plus, Trash2, Users } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name required"),
  programme: z.nativeEnum(CreateBatchBodyProgramme),
  schedule: z.string().min(2, "Schedule required"),
  startDate: z.string().min(10, "Valid date required (YYYY-MM-DD)"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

export default function Batches() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useListBatches({
    query: { queryKey: getListBatchesQueryKey() }
  });

  const createBatch = useCreateBatch();
  const deleteBatch = useDeleteBatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", programme: "bharatanatyam", schedule: "Saturdays 10 AM", startDate: format(new Date(), "yyyy-MM-dd"), capacity: 15 },
  });

  const formatProgramme = (p: string) => p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createBatch.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Batch created successfully" });
        setDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListBatchesQueryKey() });
      },
      onError: () => toast({ title: "Failed to create batch", variant: "destructive" })
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    deleteBatch.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Batch deleted" });
        queryClient.invalidateQueries({ queryKey: getListBatchesQueryKey() });
      },
      onError: () => toast({ title: "Cannot delete batch", description: "It might have enrolled students.", variant: "destructive" })
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-serif text-primary">Batches</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
              <Plus className="mr-2 h-4 w-4" /> Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-secondary/40 bg-card">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">Create New Batch</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Batch Name</FormLabel><FormControl><Input placeholder="e.g. Beginners Fall 2024" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
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
                <FormField control={form.control} name="schedule" render={({ field }) => (
                  <FormItem><FormLabel>Schedule</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem><FormLabel>Start Date (YYYY-MM-DD)</FormLabel><FormControl><Input {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="capacity" render={({ field }) => (
                    <FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createBatch.isPending} className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground">Create</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="border border-secondary/20 bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-3/4 bg-secondary/20" />
              <Skeleton className="h-4 w-1/2 bg-secondary/20" />
              <Skeleton className="h-10 w-full bg-secondary/20 mt-4" />
            </div>
          ))
        ) : batches?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border border-secondary/20 bg-card">
            No batches found.
          </div>
        ) : (
          batches?.map((batch) => (
            <div key={batch.id} className="border border-secondary/20 bg-card p-6 flex flex-col relative group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-xl text-primary">{batch.name}</h3>
                <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize
                  ${batch.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  ${batch.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : ''}
                `}>
                  {batch.status}
                </Badge>
              </div>
              <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-4">{formatProgramme(batch.programme)}</p>
              
              <div className="space-y-2 text-sm text-muted-foreground flex-1">
                <p><strong>Schedule:</strong> {batch.schedule}</p>
                <p><strong>Starts:</strong> {format(new Date(batch.startDate), "MMM d, yyyy")}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-secondary/10">
                  <Users className="h-4 w-4" />
                  <span>{batch.enrolledCount} / {batch.capacity} Enrolled</span>
                </div>
                {/* Visual fill indicator */}
                <div className="w-full h-1 bg-secondary/10 mt-2">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (batch.enrolledCount / batch.capacity) * 100)}%` }} />
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(batch.id)} 
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-none"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
