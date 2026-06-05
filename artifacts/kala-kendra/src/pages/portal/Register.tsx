import { useState } from "react";
import { Link } from "wouter";
import { UserPlus, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "form" | "sent" | "no-match" | "already-linked";

export default function PortalRegister() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${(import.meta.env["VITE_API_URL"] ?? "")}/api/portal/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim() }),
      });

      const data = await res.json() as { result?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.result === "sent") {
        setStep("sent");
      } else if (data.result === "no-match") {
        setStep("no-match");
      } else if (data.result === "already-linked") {
        setStep("already-linked");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "sent") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <h1 className="font-serif text-2xl text-primary mb-3">Check your inbox</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          We found your student record. A verification link has been sent to:
        </p>
        <p className="font-medium text-foreground mb-6">{email}</p>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Click the link in that email to verify your address and sign in to the portal.
          The link expires in 30 minutes.
        </p>
        <p className="text-xs text-muted-foreground">
          Wrong email?{" "}
          <button onClick={() => setStep("form")} className="underline hover:text-primary transition-colors">
            Go back and try again
          </button>
        </p>
      </div>
    );
  }

  if (step === "no-match") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertCircle className="text-amber-500" size={32} />
          </div>
        </div>
        <h1 className="font-serif text-2xl text-primary mb-3">Name not found</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          We couldn't find an active student record matching <strong>"{fullName}"</strong>.
          Please check the spelling and try again, or contact the school.
        </p>
        <div className="space-y-3">
          <Button onClick={() => setStep("form")} variant="outline" className="w-full rounded-none gap-2">
            <ArrowLeft size={15} /> Try again
          </Button>
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <a href="/contact" className="underline hover:text-primary transition-colors">Contact us</a>
          </p>
        </div>
      </div>
    );
  }

  if (step === "already-linked") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="text-primary" size={32} />
          </div>
        </div>
        <h1 className="font-serif text-2xl text-primary mb-3">Account already set up</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Your student record already has an email address linked. Please use the sign-in page to receive a magic link.
        </p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-full">
          <Link href="/portal/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="text-primary" size={24} />
          </div>
        </div>
        <h1 className="font-serif text-3xl text-primary mb-2">First time here?</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          If you're an existing student, enter your name and email address below.
          We'll find your record and send you a verification link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Your full name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="As registered with the school"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            autoFocus
            className="rounded-none"
          />
          <p className="text-xs text-muted-foreground">Enter your name exactly as the school knows you.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Your email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="rounded-none"
          />
          <p className="text-xs text-muted-foreground">This will become your portal login email.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-destructive text-sm">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none py-5 gap-2"
        >
          {loading ? "Looking up your record…" : (
            <>Verify &amp; get access <ArrowRight size={16} /></>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-secondary/20 text-center">
        <p className="text-xs text-muted-foreground">
          Already registered?{" "}
          <Link href="/portal/login" className="underline hover:text-primary transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
