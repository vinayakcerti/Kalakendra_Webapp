import { useState } from "react";
import { Link } from "wouter";
import {
  useListBatches,
  getListBatchesQueryKey,
  useCreateBatch,
  useUpdateBatch,
  useDeleteBatch,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users, Clock } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(2, "Code required (e.g. BHAR-JUN)"),
  name: z.string().min(2, "Name required"),
  ageRange: z.string().optional(),
  description: z.string().optional(),
  schedule: z.string().optional(),
  maxStudents: z.coerce.number().int().positive().optional().or(z.literal("")),
  active: z.boolean().default(true),
  displayOrder: z.coerce.number().default(0),
});

export default function Batches() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useListBatches({
    query: { queryKey: getListBatchesQueryKey() },
  });

  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const deleteBatch = useDeleteBatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", name: "", ageRange: "", description: "", schedule: "", maxStudents: "", active: true, displayOrder: 0 },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createBatch.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Batch created" });
        setDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListBatchesQueryKey() });
      },
      onError: () => toast({ title: "Failed to create batch", variant: "destructive" }),
    });
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateBatch.mutate({ id, data: { active: !active } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBatchesQueryKey() }),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this batch? Students in this batch will be unassigned.")) return;
    deleteBatch.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Batch deleted" });
        queryClient.invalidateQueries({ queryKey: getListBatchesQueryKey() });
      },
      onError: () => toast({ title: "Cannot delete batch", variant: "destructive" }),
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
          <DialogContent className="rounded-none border-secondary/40 bg-card max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-primary">Create New Batch</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="e.g. BHAR-JUN" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="displayOrder" render={({ field }) => (
                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g. Bharatanatyam — Juniors" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ageRange" render={({ field }) => (
                  <FormItem><FormLabel>Age Range</FormLabel><FormControl><Input placeholder="e.g. 6–12 years" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="schedule" render={({ field }) => (
                  <FormItem><FormLabel>Schedule</FormLabel><FormControl><Input placeholder="e.g. Tuesday & Thursday, 5:00–6:30 PM" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="maxStudents" render={({ field }) => (
                    <FormItem><FormLabel>Max Students</FormLabel><FormControl><Input type="number" min="1" placeholder="e.g. 12" {...field} className="rounded-none" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="rounded-none" rows={3} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!mt-0">Active (accepting students)</FormLabel>
                  </FormItem>
                )} />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createBatch.isPending} className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground">
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-secondary/20 bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-3/4 bg-secondary/20" />
                <Skeleton className="h-4 w-1/2 bg-secondary/20" />
                <Skeleton className="h-10 w-full bg-secondary/20 mt-4" />
              </div>
            ))
          : batches?.length === 0
          ? (
            <div className="col-span-full text-center py-12 text-muted-foreground border border-secondary/20 bg-card">
              No batches found.
            </div>
          )
          : batches?.map((batch) => (
              <div key={batch.id} className="border border-secondary/20 bg-card p-6 flex flex-col relative group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Link href={`/admin/batches/${batch.id}`}>
                      <h3 className="font-serif text-xl text-primary hover:underline underline-offset-4 cursor-pointer">{batch.name}</h3>
                    </Link>
                    <p className="text-xs font-mono text-secondary/60 mt-0.5">{batch.code}</p>
                  </div>
                  <Badge variant="outline" className={`rounded-none border-secondary/40 ${batch.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
                    {batch.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {batch.ageRange && (
                  <p className="text-xs text-secondary uppercase tracking-widest mb-2">{batch.ageRange}</p>
                )}

                {batch.schedule && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3 shrink-0" />
                    {batch.schedule}
                  </p>
                )}

                {batch.description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">{batch.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-secondary/10 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{batch.studentCount} active student{batch.studentCount !== 1 ? "s" : ""}</span>
                  </div>
                  {batch.maxStudents != null && (
                    <span className="text-xs text-muted-foreground">Cap: {batch.maxStudents}</span>
                  )}
                </div>

                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(batch.id, batch.active)}
                    className="rounded-none border-secondary/40 text-xs flex-1"
                  >
                    {batch.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(batch.id)}
                    className="rounded-none text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
