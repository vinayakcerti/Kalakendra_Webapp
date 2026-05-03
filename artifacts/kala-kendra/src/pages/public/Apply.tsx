import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useSearch } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCreateAdmission, useListBatches, getListBatchesQueryKey, useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Info, X } from "lucide-react";

const formSchema = z.object({
  applicantType: z.enum(["adult", "child"]),
  studentName: z.string().min(2, "Student name is required"),
  studentDob: z.string().min(1, "Date of birth is required"),
  studentGender: z.string().optional(),

  studentEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  studentPhone: z.string().optional(),

  parentName: z.string().optional(),
  parentRelationship: z.string().optional(),
  parentEmail: z.string().email().optional().or(z.literal("")),
  parentPhone: z.string().optional(),

  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),

  addressStreet: z.string().min(2, "Street address is required"),
  addressPostal: z.string().min(2, "Postal code is required"),
  addressCity: z.string().min(2, "City is required"),

  batch: z.string().min(1, "Please select a batch"),
  experience: z.enum(["none", "some", "significant"]),
  experienceDetails: z.string().optional(),

  willStagePerform: z.enum(["yes", "no", "maybe"]),
  motivation: z.string().optional(),
  referralSource: z.string().optional(),
  photoConsent: z.enum(["yes-all", "yes-internal", "no"]),
  rulesConsent: z.literal("agree", { errorMap: () => ({ message: "You must agree to the rules" }) }),
  suggestions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-secondary/20 pb-2 mb-6">
      <h3 className="font-serif text-xl text-primary">{children}</h3>
    </div>
  );
}

export default function Apply() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [preselectedBatch, setPreselectedBatch] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const search = useSearch();
  const { data: batches } = useListBatches({}, { query: { queryKey: getListBatchesQueryKey() } });
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantType: "adult",
      studentName: "",
      studentDob: "",
      studentGender: "",
      studentEmail: "",
      studentPhone: "",
      parentName: "",
      parentRelationship: "",
      parentEmail: "",
      parentPhone: "",
      emergencyName: "",
      emergencyPhone: "",
      addressStreet: "",
      addressPostal: "",
      addressCity: "Gothenburg",
      batch: "",
      experience: "none",
      experienceDetails: "",
      willStagePerform: "maybe",
      motivation: "",
      referralSource: "",
      photoConsent: "yes-internal",
      rulesConsent: undefined as unknown as "agree",
      suggestions: "",
    },
  });

  // Auto-select batch from ?batch= query param once batches are loaded
  useEffect(() => {
    if (!batches || !search) return;
    const params = new URLSearchParams(search);
    const batchName = params.get("batch");
    if (!batchName) return;
    const matched = batches.find(
      (b) => b.name.toLowerCase() === batchName.toLowerCase() && b.active
    );
    if (matched) {
      form.setValue("batch", matched.code, { shouldValidate: true });
      setPreselectedBatch(matched.name);
    }
  }, [batches, search]);

  const applicantType = form.watch("applicantType");
  const createAdmission = useCreateAdmission();

  function onSubmit(values: FormValues) {
    createAdmission.mutate(
      { data: values },
      {
        onSuccess: () => setSubmitted(true),
        onError: () =>
          toast({
            title: "Submission Failed",
            description: "There was an error submitting your application. Please try again.",
            variant: "destructive",
          }),
      }
    );
  }

  if (settings && !settings.acceptingApplications) {
    return (
      <div className="animate-in fade-in duration-700 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-6 font-semibold">Admissions</p>
        <h2 className="text-4xl font-serif text-primary mb-6">Applications Are Currently Closed</h2>
        <div className="gold-divider max-w-xs mx-auto" />
        <p className="text-lg text-muted-foreground max-w-lg mt-6 mb-10 leading-relaxed">
          We are not accepting new applications at this time. Please check back later or get in touch with us directly — we would be happy to let you know when the next intake opens.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="border-secondary text-primary hover:bg-secondary/10 rounded-none">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-none text-primary hover:bg-transparent hover:text-secondary underline decoration-secondary/40 underline-offset-4">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="animate-in fade-in duration-700 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-serif text-primary mb-6">Application Received</h2>
        <div className="gold-divider max-w-xs mx-auto" />
        <p className="text-lg text-muted-foreground max-w-lg mb-8 mt-6">
          Thank you for expressing interest in Kala Kendra Sweden. We have received your application and our admissions team will review it shortly. We will be in touch via email.
        </p>
        <Button asChild variant="outline" className="border-secondary text-primary hover:bg-secondary/10 rounded-none">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const inputClass = "rounded-none border-secondary/40 focus-visible:ring-primary bg-background";

  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-5xl font-serif text-primary mb-6 text-center">Admission Application</h2>
        <p className="text-center text-muted-foreground mb-12">
          Please fill out the form below carefully. Learning a classical art form is a long-term commitment, and we seek students who are deeply motivated.
        </p>

        {/* Pre-selected batch banner */}
        {preselectedBatch && !bannerDismissed && (
          <div className="flex items-start gap-3 bg-secondary/10 border border-secondary/30 px-5 py-4 mb-8">
            <Info className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-muted-foreground">
              <span className="font-medium text-primary">{preselectedBatch}</span> has been pre-selected for you.
              You can change the batch selection in the Programme section below.
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="bg-card border border-secondary/20 p-8 md:p-12 relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-secondary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-secondary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-secondary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-secondary" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

              {/* Applicant Type */}
              <FormField control={form.control} name="applicantType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-serif text-primary text-lg">Applicant Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="adult" id="adult" />
                        <label htmlFor="adult" className="cursor-pointer">Adult (applying for yourself)</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="child" id="child" />
                        <label htmlFor="child" className="cursor-pointer">Child (parent applying on behalf)</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Student Details */}
              <div>
                <SectionHeading>Student Details</SectionHeading>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="studentName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="studentDob" render={({ field }) => (
                    <FormItem><FormLabel>Date of Birth *</FormLabel><FormControl><Input type="date" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="studentGender" render={({ field }) => (
                    <FormItem><FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl><SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Contact */}
              {applicantType === "adult" ? (
                <div>
                  <SectionHeading>Contact Information</SectionHeading>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="studentEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="studentPhone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+46…" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              ) : (
                <div>
                  <SectionHeading>Parent / Guardian Details</SectionHeading>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="parentName" render={({ field }) => (
                      <FormItem><FormLabel>Parent / Guardian Name</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="parentRelationship" render={({ field }) => (
                      <FormItem><FormLabel>Relationship</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl><SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="parentEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="parentPhone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+46…" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div>
                <SectionHeading>Emergency Contact</SectionHeading>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="emergencyName" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="emergencyPhone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+46…" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Address */}
              <div>
                <SectionHeading>Address</SectionHeading>
                <div className="space-y-4">
                  <FormField control={form.control} name="addressStreet" render={({ field }) => (
                    <FormItem><FormLabel>Street Address *</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="addressPostal" render={({ field }) => (
                      <FormItem><FormLabel>Postal Code *</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="addressCity" render={({ field }) => (
                      <FormItem><FormLabel>City *</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Programme */}
              <div>
                <SectionHeading>Programme</SectionHeading>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="batch" render={({ field }) => (
                    <FormItem><FormLabel>Batch / Class *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={inputClass}><SelectValue placeholder="Select a batch" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {batches?.filter(b => b.active).map((b) => (
                            <SelectItem key={b.id} value={b.code}>{b.name}{b.ageRange ? ` (${b.ageRange})` : ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem><FormLabel>Prior Experience *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">None — complete beginner</SelectItem>
                          <SelectItem value="some">Some — a few years of training</SelectItem>
                          <SelectItem value="significant">Significant — advanced or performed publicly</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                </div>
                <div className="mt-6">
                  <FormField control={form.control} name="experienceDetails" render={({ field }) => (
                    <FormItem><FormLabel>Experience Details (if any)</FormLabel><FormControl><Textarea placeholder="Describe any previous training, teachers, or performances…" className={`${inputClass} min-h-[100px]`} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Additional */}
              <div>
                <SectionHeading>Additional Information</SectionHeading>
                <div className="space-y-6">
                  <FormField control={form.control} name="motivation" render={({ field }) => (
                    <FormItem><FormLabel>Motivation</FormLabel><FormControl><Textarea placeholder="Why do you wish to study this classical art form at Kala Kendra Sweden?" className={`${inputClass} min-h-[120px]`} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="willStagePerform" render={({ field }) => (
                    <FormItem><FormLabel>Would you be interested in stage performances? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes, definitely</SelectItem>
                          <SelectItem value="maybe">Maybe, when ready</SelectItem>
                          <SelectItem value="no">No, I prefer to learn privately</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="photoConsent" render={({ field }) => (
                    <FormItem><FormLabel>Photo / Video Consent *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="yes-all">Yes — may be used publicly (social media, website)</SelectItem>
                          <SelectItem value="yes-internal">Yes — internal use only (school records, WhatsApp group)</SelectItem>
                          <SelectItem value="no">No — do not photograph or film me / the child</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="referralSource" render={({ field }) => (
                    <FormItem><FormLabel>How did you hear about us?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl><SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="friend">Friend / family</SelectItem>
                          <SelectItem value="social_media">Social media</SelectItem>
                          <SelectItem value="google">Google search</SelectItem>
                          <SelectItem value="event">Event or performance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="suggestions" render={({ field }) => (
                    <FormItem><FormLabel>Any other comments or questions?</FormLabel><FormControl><Textarea className={`${inputClass} min-h-[80px]`} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Consent */}
              <div className="bg-secondary/5 border border-secondary/20 p-6">
                <FormField control={form.control} name="rulesConsent" render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value === "agree"}
                        onCheckedChange={(checked) => field.onChange(checked ? "agree" : "")}
                        className="rounded-none mt-1 border-secondary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="font-medium">I agree to the school's rules and code of conduct *</FormLabel>
                      <p className="text-sm text-muted-foreground mt-1">
                        I understand that Kala Kendra Sweden expects commitment, respect for the tradition, and regular attendance. Fees are due monthly and must be paid on time.
                      </p>
                      <FormMessage />
                    </div>
                  </FormItem>
                )} />
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={createAdmission.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-12 py-6 text-lg w-full md:w-auto"
                >
                  {createAdmission.isPending ? "Submitting…" : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
