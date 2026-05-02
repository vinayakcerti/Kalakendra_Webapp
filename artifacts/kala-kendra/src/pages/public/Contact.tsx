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
                <p className="text-primary font-serif text-xl">Kala Kendra Studios</p>
                <p className="text-muted-foreground">Gothenburg, Sweden</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2">Email</h4>
                <p className="text-muted-foreground">namaskaram@kalakendra.se</p>
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
