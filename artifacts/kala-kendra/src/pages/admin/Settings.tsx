import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetSettings,
  useUpdateSettings,
  getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  contactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  addressLine: z.string().optional().or(z.literal("")),
  monthlyFeeSek: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(0, "Cannot be negative"),
  acceptingApplications: z.boolean(),
  dailyReminderEnabled: z.boolean(),
  dailyReminderHour: z.coerce.number().int().min(0).max(23),
});

type FormValues = z.infer<typeof formSchema>;

const inputClass = "rounded-none border-secondary/40 focus-visible:ring-primary bg-background";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-secondary/20 pb-4 mb-8">
      <h3 className="font-serif text-xl text-primary">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminAccount {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ─── Add-Admin form schema ────────────────────────────────────────────────────

const addAdminSchema = z.object({
  email: z.string().email("Valid email required"),
  fullName: z.string().min(2, "Full name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "teacher"]),
});
type AddAdminValues = z.infer<typeof addAdminSchema>;

// ─── AdminAccountsSection ─────────────────────────────────────────────────────

function AdminAccountsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Fetch admin list
  const { data, isLoading } = useQuery<{ admins: AdminAccount[] }>({
    queryKey: ["admin-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/admins", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load admins");
      return res.json() as Promise<{ admins: AdminAccount[] }>;
    },
  });

  const admins = data?.admins ?? [];

  // Toggle active/inactive
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to update admin");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      toast({ title: "Admin updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  // Add new admin
  const addForm = useForm<AddAdminValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: { email: "", fullName: "", password: "", role: "teacher" },
  });

  const addMutation = useMutation({
    mutationFn: async (values: AddAdminValues) => {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to create admin");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      addForm.reset();
      setShowForm(false);
      toast({ title: "Admin account created", description: "They can now log in with their email and password." });
    },
    onError: (err: Error) => {
      toast({ title: "Creation failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <section className="mb-14">
      <SectionHeading
        title="Admin Accounts"
        description="Manage who has access to this admin portal. Deactivating an account immediately ends all active sessions."
      />

      {/* Current admins table */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="border border-secondary/20 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-secondary/5 text-xs uppercase tracking-widest text-secondary">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Last login</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, i) => (
                <tr key={admin.id} className={i % 2 === 0 ? "bg-background" : "bg-card"}>
                  <td className="px-4 py-3 font-medium text-foreground">{admin.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={admin.role === "admin" ? "default" : "secondary"} className="capitalize text-xs">
                      {admin.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${admin.active ? "text-green-700" : "text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${admin.active ? "bg-green-600" : "bg-gray-400"}`} />
                      {admin.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {admin.lastLoginAt
                      ? format(new Date(admin.lastLoginAt), "d MMM yyyy")
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`text-xs rounded-none border ${admin.active ? "border-red-200 text-red-700 hover:bg-red-50" : "border-secondary/30 text-muted-foreground hover:bg-secondary/10"}`}
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate({ id: admin.id, active: !admin.active })}
                    >
                      {admin.active ? "Deactivate" : "Reactivate"}
                    </Button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No admin accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add admin form toggle */}
      {!showForm ? (
        <Button
          type="button"
          variant="outline"
          className="rounded-none border-secondary/40 text-sm"
          onClick={() => setShowForm(true)}
        >
          + Add admin account
        </Button>
      ) : (
        <div className="border border-secondary/20 bg-card p-6">
          <h4 className="font-medium text-foreground mb-6">New admin account</h4>
          <form
            onSubmit={addForm.handleSubmit((v) => addMutation.mutate(v))}
            className="space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full name *</label>
                <Input
                  placeholder="e.g. Priya Sharma"
                  {...addForm.register("fullName")}
                  className={inputClass}
                />
                {addForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{addForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email address *</label>
                <Input
                  type="email"
                  placeholder="priya@kalakendra.se"
                  {...addForm.register("email")}
                  className={inputClass}
                />
                {addForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{addForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  {...addForm.register("password")}
                  className={inputClass}
                />
                {addForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{addForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role *</label>
                <select
                  {...addForm.register("role")}
                  className={`w-full h-10 px-3 text-sm border border-secondary/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Admins can manage all settings. Teachers have read access only.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="rounded-none bg-primary text-primary-foreground px-8"
              >
                {addMutation.isPending ? "Creating…" : "Create account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-none"
                onClick={() => { setShowForm(false); addForm.reset(); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

// ─── Main Settings page ───────────────────────────────────────────────────────

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useGetSettings({
    query: { queryKey: getGetSettingsQueryKey() },
  });

  const updateSettings = useUpdateSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      contactEmail: "",
      contactPhone: "",
      addressLine: "",
      monthlyFeeSek: 0,
      acceptingApplications: true,
      dailyReminderEnabled: true,
      dailyReminderHour: 8,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        schoolName: settings.schoolName,
        contactEmail: settings.contactEmail ?? "",
        contactPhone: settings.contactPhone ?? "",
        addressLine: settings.addressLine ?? "",
        monthlyFeeSek: settings.monthlyFeeSek,
        acceptingApplications: settings.acceptingApplications,
        dailyReminderEnabled: settings.dailyReminderEnabled,
        dailyReminderHour: settings.dailyReminderHour,
      });
    }
  }, [settings, form]);

  function onSubmit(values: FormValues) {
    updateSettings.mutate(
      {
        data: {
          ...values,
          contactEmail: values.contactEmail || undefined,
          contactPhone: values.contactPhone || undefined,
          addressLine: values.addressLine || undefined,
          dailyReminderEnabled: values.dailyReminderEnabled,
          dailyReminderHour: values.dailyReminderHour,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: "Settings saved", description: "Changes have been applied." });
        },
        onError: () => {
          toast({
            title: "Save failed",
            description: "There was an error saving your settings. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-primary">Settings</h1>
        {settings?.updatedAt && (
          <p className="text-muted-foreground text-sm mt-1">
            Last updated {format(new Date(settings.updatedAt), "d MMM yyyy, HH:mm")}
          </p>
        )}
      </div>

      {/* ── Admin Accounts ─────────────────────────────────────── */}
      <AdminAccountsSection />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-14">

          {/* ── Admissions ─────────────────────────────────────────── */}
          <section>
            <SectionHeading
              title="Admissions"
              description="Control whether the public application form is open or closed."
            />

            <FormField
              control={form.control}
              name="acceptingApplications"
              render={({ field }) => (
                <FormItem className="flex items-start justify-between gap-6 bg-card border border-secondary/20 p-6">
                  <div className="flex-1">
                    <FormLabel className="text-base font-medium">
                      Accept new applications
                    </FormLabel>
                    <FormDescription className="mt-1">
                      When turned off, the public Apply page will show a "Admissions are currently closed" notice and the form will be disabled.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary mt-1 shrink-0"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="mt-6 bg-secondary/5 border border-secondary/20 p-4">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">Status</p>
              <p className="text-sm text-muted-foreground">
                The application form is currently{" "}
                <span className={`font-semibold ${form.watch("acceptingApplications") ? "text-green-700" : "text-red-700"}`}>
                  {form.watch("acceptingApplications") ? "open" : "closed"}
                </span>
                {" "}to new applicants.
              </p>
            </div>
          </section>

          {/* ── Fees ───────────────────────────────────────────────── */}
          <section>
            <SectionHeading
              title="Fees"
              description="The standard monthly tuition fee shown on the admissions correspondence."
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="monthlyFeeSek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Fee (SEK) *</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="flex items-center px-3 border border-r-0 border-secondary/40 bg-muted text-muted-foreground text-sm">
                          SEK
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="50"
                          {...field}
                          className={`${inputClass} border-l-0`}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Standard monthly fee per student per programme.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-start pt-6">
                <div className="bg-card border border-secondary/20 p-4 w-full">
                  <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-1">
                    Annual Total
                  </p>
                  <p className="text-2xl font-serif text-primary">
                    {(form.watch("monthlyFeeSek") * 12).toLocaleString("sv-SE")} kr
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per student per year</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Automated Reminders ────────────────────────────────── */}
          <section>
            <SectionHeading
              title="Automated Reminders"
              description="A scheduled job runs every morning and marks overdue fees, then emails affected students automatically."
            />

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="dailyReminderEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-6 bg-card border border-secondary/20 p-6">
                    <div className="flex-1">
                      <FormLabel className="text-base font-medium">
                        Enable daily reminder job
                      </FormLabel>
                      <FormDescription className="mt-1">
                        When on, the server automatically marks pending fees as overdue each morning and sends reminder emails to students. When off, you can still trigger reminders manually from the Fees page.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary mt-1 shrink-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyReminderHour"
                render={({ field }) => (
                  <FormItem className={`transition-opacity ${form.watch("dailyReminderEnabled") ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                    <FormLabel>Send time (Stockholm time)</FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                        disabled={!form.watch("dailyReminderEnabled")}
                      >
                        <SelectTrigger className="rounded-none border-secondary/40 w-56">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, h) => (
                            <SelectItem key={h} value={String(h)}>
                              {String(h).padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      The job will run once per day at this hour. Changes take effect immediately after saving — no server restart required.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-secondary/5 border border-secondary/20 p-4">
                <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">Current Schedule</p>
                <p className="text-sm text-muted-foreground">
                  {form.watch("dailyReminderEnabled") ? (
                    <>
                      Job is <span className="font-semibold text-green-700">active</span> — runs daily at{" "}
                      <span className="font-semibold text-foreground">
                        {String(form.watch("dailyReminderHour")).padStart(2, "0")}:00 Europe/Stockholm
                      </span>
                    </>
                  ) : (
                    <>
                      Job is <span className="font-semibold text-red-700">disabled</span> — no automatic reminders will be sent.
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* ── School Information ─────────────────────────────────── */}
          <section>
            <SectionHeading
              title="School Information"
              description="Basic details about the institution."
            />

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name *</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Vasagatan 12, 411 24 Gothenburg"
                        {...field}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormDescription>Shown on official correspondence.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* ── Contact Details ────────────────────────────────────── */}
          <section>
            <SectionHeading
              title="Contact Details"
              description="Used in system emails and on the Contact page."
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="namaskaram@kalakendra.se"
                        {...field}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+46 70 000 00 00" {...field} className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* ── Read-only info ─────────────────────────────────────── */}
          <section>
            <SectionHeading
              title="System Information"
              description="Read-only — managed by the platform."
            />

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Database", value: "PostgreSQL" },
                { label: "Environment", value: "Production" },
                { label: "Record ID", value: `#${settings?.id ?? 1}` },
              ].map((item) => (
                <div key={item.label} className="bg-card border border-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                    {item.label}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Save ───────────────────────────────────────────────── */}
          <div className="border-t border-secondary/20 pt-8 flex items-center gap-4">
            <Button
              type="submit"
              disabled={updateSettings.isPending || !form.formState.isDirty}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10"
            >
              {updateSettings.isPending ? "Saving…" : "Save Settings"}
            </Button>
            {!form.formState.isDirty && !updateSettings.isPending && (
              <p className="text-sm text-muted-foreground">No unsaved changes.</p>
            )}
            {form.formState.isDirty && (
              <p className="text-sm text-amber-700 font-medium">You have unsaved changes.</p>
            )}
          </div>

        </form>
      </Form>
    </div>
  );
}
