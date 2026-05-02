import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";

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
import { useToast } from "@/hooks/use-toast";
import { useCreateAdmission, CreateAdmissionBodyProgramme, CreateAdmissionBodyAgeGroup } from "@workspace/api-client-react";

const formSchema = z.object({
  applicantName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  programme: z.nativeEnum(CreateAdmissionBodyProgramme, { required_error: "Please select a programme" }),
  ageGroup: z.nativeEnum(CreateAdmissionBodyAgeGroup, { required_error: "Please select an age group" }),
  experience: z.string().optional(),
  motivation: z.string().min(10, "Please briefly share your motivation").optional(),
});

export default function Apply() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultProgramme = searchParams.get("programme") as CreateAdmissionBodyProgramme | undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantName: "",
      email: "",
      phone: "",
      programme: defaultProgramme && Object.values(CreateAdmissionBodyProgramme).includes(defaultProgramme) ? defaultProgramme : undefined,
      experience: "",
      motivation: "",
    },
  });

  const createAdmission = useCreateAdmission();

  function onSubmit(values: z.infer<typeof formSchema>) {
    createAdmission.mutate(
      { data: values },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
        onError: () => {
          toast({
            title: "Submission Failed",
            description: "There was an error submitting your application. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  }

  if (submitted) {
    return (
      <div className="animate-in fade-in duration-700 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-serif text-primary mb-6">Application Received</h2>
        <div className="gold-divider max-w-xs mx-auto" />
        <p className="text-lg text-muted-foreground max-w-lg mb-8">
          Thank you for expressing interest in Kala Kendra Sweden. We have received your application and our admissions team will review it shortly. We will contact you via email with the next steps.
        </p>
        <Button asChild variant="outline" className="border-secondary text-primary hover:bg-secondary/10 rounded-none">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-5xl font-serif text-primary mb-6 text-center">Admission Application</h2>
        <p className="text-center text-muted-foreground mb-12">
          Please fill out the form below carefully. Learning a classical art form is a long-term commitment, and we seek students who are deeply motivated.
        </p>

        <div className="bg-card border border-secondary/20 p-8 md:p-12 relative">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-secondary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-secondary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-secondary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-secondary" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-primary text-lg">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-primary text-lg">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-primary text-lg">Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+46..." className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="programme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-primary text-lg">Programme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-none border-secondary/40 focus:ring-primary bg-background">
                            <SelectValue placeholder="Select discipline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bharatanatyam">Bharatanatyam</SelectItem>
                          <SelectItem value="carnatic_vocal">Carnatic Vocal</SelectItem>
                          <SelectItem value="carnatic_instrumental">Carnatic Instrumental</SelectItem>
                          <SelectItem value="kerala_arts">Kerala Arts</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-primary text-lg">Age Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-none border-secondary/40 focus:ring-primary bg-background">
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="child">Child (Under 13)</SelectItem>
                          <SelectItem value="teen">Teen (13-18)</SelectItem>
                          <SelectItem value="adult">Adult (18+)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="gold-divider opacity-50" />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-serif text-primary text-lg">Prior Experience (if any)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail any previous training in classical arts..." 
                        className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-serif text-primary text-lg">Motivation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Why do you wish to study this classical art form?" 
                        className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 flex justify-center">
                <Button 
                  type="submit" 
                  disabled={createAdmission.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-12 py-6 text-lg w-full md:w-auto border border-primary/20"
                >
                  {createAdmission.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
