import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
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
