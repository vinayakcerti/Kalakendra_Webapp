
import { useParams, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetStudent,
  useUpdateStudent,
  useDeleteStudent,
  useListBatches,
  getGetStudentQueryKey,
  getListStudentsQueryKey,
  getListBatchesQueryKey,
} from "@workspace/api-client-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  dob: z.string().optional().or(z.literal("")),
  batchId: z.string().uuid().optional().or(z.literal("")),
  primaryContactName: z.string().optional().or(z.literal("")),
  primaryContactEmail: z.string().email("Valid email").optional().or(z.literal("")),
  primaryContactPhone: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "withdrawn"]),
});

type FormValues = z.infer<typeof formSchema>;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  inactive: "bg-amber-100 text-amber-800 border-amber-200",
  withdrawn: "bg-red-100 text-red-800 border-red-200",
};

const inputClass = "rounded-none border-secondary/40 focus-visible:ring-primary bg-background";

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-secondary/10 py-3 text-sm">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{value ?? <span className="text-muted-foreground/50 italic">—</span>}</span>
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useGetStudent(id, {
    query: { queryKey: getGetStudentQueryKey(id) },
  });

  const { data: batches = [] } = useListBatches({
    query: { queryKey: getListBatchesQueryKey() },
  });

  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  // dob may come from DB as ISO datetime "…T00:00:00.000Z" — truncate to "YYYY-MM-DD"
  const dobDate = student?.dob ? student.dob.slice(0, 10) : "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    resetOptions: { keepDirty: false },
    // `values` makes the form reactive to external data — auto-resets when student loads/changes
    values: student
      ? {
          fullName: student.fullName,
          dob: dobDate,
          batchId: student.batchId ?? "",
          primaryContactName: student.primaryContactName ?? "",
          primaryContactEmail: student.primaryContactEmail ?? "",
          primaryContactPhone: student.primaryContactPhone ?? "",
          status: student.status as "active" | "inactive" | "withdrawn",
        }
      : undefined,
    defaultValues: {
      fullName: "",
      dob: "",
      batchId: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      status: "active",
    },
  });

  function onSubmit(values: FormValues) {
    updateStudent.mutate(
      {
        id,
        data: {
          fullName: values.fullName,
          dob: values.dob || undefined,
          batchId: values.batchId || null,
          primaryContactName: values.primaryContactName || undefined,
          primaryContactEmail: values.primaryContactEmail || undefined,
          primaryContactPhone: values.primaryContactPhone || undefined,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          // Invalidating the query re-fetches and the `values` prop auto-resets the form
          queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          toast({ title: "Student record updated" });
        },
        onError: () =>
          toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!confirm(`Remove ${student?.fullName} from the student registry? This cannot be undone.`)) return;
    deleteStudent.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          window.history.back();
        },
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48 bg-secondary/20" />
        <div className="grid md:grid-cols-2 gap-8">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-secondary/20" />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl py-24 text-center">
        <p className="text-2xl font-serif text-primary mb-4">Student not found</p>
        <Link href="/admin/students">
          <Button variant="outline" className="rounded-none border-secondary">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/students" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-primary">{student.fullName}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge
                variant="outline"
                className={`rounded-none border capitalize text-xs px-2 py-0.5 ${STATUS_STYLES[student.status] ?? ""}`}
              >
                {student.status}
              </Badge>
              {student.batchName && (
                <span className="text-sm text-muted-foreground">
                  {student.batchName}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Enrolled {format(new Date(student.enrolledAt), "d MMM yyyy")}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-none shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Student
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: form */}
        <div className="md:col-span-2 space-y-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

              {/* Student Details */}
              <section className="bg-card border border-secondary/20 p-6">
                <h3 className="font-serif text-xl text-primary mb-6 pb-3 border-b border-secondary/20">
                  Student Details
                </h3>
                <div className="space-y-5">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input {...field} className={inputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="dob" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} className={inputClass} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={inputClass}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="batchId" render={({ field }) => {
                    // Fall back to student.batchId if the form hasn't been reset yet (values-prop delay)
                    const effectiveId = field.value || student?.batchId || "";
                    const selectedBatch = batches.find((b) => b.id === effectiveId);
                    const displayLabel = selectedBatch
                      ? `${selectedBatch.name}${selectedBatch.ageRange ? ` (${selectedBatch.ageRange})` : ""}`
                      : effectiveId
                        ? (student?.batchName ?? "Loading…")
                        : "No batch assigned";
                    return (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                        value={field.value || "__none__"}
                      >
                        <FormControl>
                          <SelectTrigger className={inputClass}>
                            <span className={field.value ? "text-foreground" : "text-muted-foreground"}>
                              {displayLabel}
                            </span>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">No batch assigned</SelectItem>
                          {batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                              {b.ageRange ? ` (${b.ageRange})` : ""}
                              {!b.active ? " — inactive" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                    );
                  }} />
                </div>
              </section>

              {/* Contact Details */}
              <section className="bg-card border border-secondary/20 p-6">
                <h3 className="font-serif text-xl text-primary mb-6 pb-3 border-b border-secondary/20">
                  Contact Details
                </h3>
                <div className="space-y-5">
                  <FormField control={form.control} name="primaryContactName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl><Input placeholder="Parent or guardian name" {...field} className={inputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="primaryContactEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} className={inputClass} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="primaryContactPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="+46…" {...field} className={inputClass} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </section>

              {/* Save */}
              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={updateStudent.isPending || !form.formState.isDirty}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8"
                >
                  {updateStudent.isPending ? "Saving…" : "Save Changes"}
                </Button>
                {form.formState.isDirty && !updateStudent.isPending && (
                  <p className="text-sm text-amber-700 font-medium">Unsaved changes</p>
                )}
                {!form.formState.isDirty && !updateStudent.isPending && (
                  <p className="text-sm text-muted-foreground">No changes</p>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Right: sidebar info */}
        <div className="space-y-6">
          {/* Record summary */}
          <div className="bg-card border border-secondary/20 p-5">
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">Record</p>
            <FieldRow label="Student ID" value={<span className="font-mono text-xs break-all">{student.id}</span>} />
            <FieldRow label="Status" value={
              <span className={`capitalize text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[student.status]?.split(" ").slice(0,2).join(" ")}`}>
                {student.status}
              </span>
            } />
            <FieldRow label="Enrolled" value={format(new Date(student.enrolledAt), "d MMM yyyy")} />
            <FieldRow label="Last updated" value={format(new Date(student.updatedAt), "d MMM yyyy")} />
          </div>

          {/* Linked admission */}
          {student.admissionId ? (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                Linked Application
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                This student was enrolled from an admission application.
              </p>
              <Link href={`/admin/admissions/${student.admissionId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border-secondary/40 text-sm w-full"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">
                Linked Application
              </p>
              <p className="text-sm text-muted-foreground italic">
                Manually enrolled — no linked application.
              </p>
            </div>
          )}

          {/* Quick contact */}
          {(student.primaryContactEmail || student.primaryContactPhone) && (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                Quick Contact
              </p>
              {student.primaryContactName && (
                <p className="text-sm font-medium text-primary mb-3">{student.primaryContactName}</p>
              )}
              {student.primaryContactEmail && (
                <a
                  href={`mailto:${student.primaryContactEmail}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2 break-all"
                >
                  ✉ {student.primaryContactEmail}
                </a>
              )}
              {student.primaryContactPhone && (
                <a
                  href={`tel:${student.primaryContactPhone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ☎ {student.primaryContactPhone}
                </a>
              )}
            </div>
          )}

          {/* Batch details */}
          {student.batchName && (
            <div className="bg-card border border-secondary/20 p-5">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                Current Batch
              </p>
              <p className="font-serif text-lg text-primary">{student.batchName}</p>
              <Link href="/admin/batches">
                <Button variant="ghost" size="sm" className="rounded-none text-xs text-muted-foreground mt-3 p-0 h-auto hover:text-primary">
                  View all batches →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
