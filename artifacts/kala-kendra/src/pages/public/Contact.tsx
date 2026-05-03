import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { useToast } from "@/hooks/use-toast";
import { useCreateEnquiry } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message is required"),
});

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const createEnquiry = useCreateEnquiry();

  function onSubmit(values: z.infer<typeof formSchema>) {
    createEnquiry.mutate(
      { data: values },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
        onError: () => {
          toast({
            title: "Submission Failed",
            description: "There was an error sending your message. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-5xl font-serif text-primary mb-16 text-center">Contact Us</h2>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl font-serif text-primary mb-6">Reach Out</h3>
            <p className="text-muted-foreground mb-8">
              For general inquiries, performance requests, or questions regarding our programmes, please use the contact form. We aim to respond within 2-3 business days.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">Location</h4>
                <p className="text-primary font-serif text-xl">Kala Kendra Sweden</p>
                <p className="text-muted-foreground">Gothenburg, Sweden</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">Email</h4>
                <a href="mailto:kalakendrasweden@gmail.com" className="text-primary hover:underline">
                  kalakendrasweden@gmail.com
                </a>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">WhatsApp</h4>
                <a
                  href="https://wa.me/919207413346"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  +91 92074 13346
                </a>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">Social Media</h4>
                <div className="space-y-2">
                  <a
                    href="https://www.instagram.com/kala_kendra_sweden"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                    </svg>
                    @kala_kendra_sweden
                  </a>
                  <a
                    href="https://www.facebook.com/share/1CcCbdDaew/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Kala Kendra Sweden
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">Phone · Sweden</h4>
                <div className="space-y-1">
                  <a href="tel:+46769649871" className="flex items-center gap-2 text-primary hover:underline text-sm">
                    <svg className="h-4 w-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.62-.62a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                    +46 769 649 871
                  </a>
                  <a href="tel:+46720464163" className="flex items-center gap-2 text-primary hover:underline text-sm">
                    <svg className="h-4 w-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.62-.62a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                    </svg>
                    +46 720 464 163
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-secondary/20 p-8">
            {submitted ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-serif text-primary mb-4">Message Sent</h3>
                <p className="text-muted-foreground">
                  Thank you for reaching out. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-serif text-primary text-lg">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background" {...field} />
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
                        <FormLabel className="font-serif text-primary text-lg">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-serif text-primary text-lg">Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Inquiry regarding..." className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-serif text-primary text-lg">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your message here..." 
                            className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={createEnquiry.isPending}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                  >
                    {createEnquiry.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
