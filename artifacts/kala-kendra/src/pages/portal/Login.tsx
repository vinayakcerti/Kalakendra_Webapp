import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${(import.meta.env["VITE_API_URL"] ?? "")}/api/portal/auth/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-secondary" size={48} />
        </div>
        <h1 className="font-serif text-2xl text-primary mb-3">Check your inbox</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          If <strong>{email}</strong> is registered with an active student, we've sent a sign-in link.
          It expires in 15 minutes.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn't receive it?{" "}
          <button onClick={() => setSent(false)} className="underline hover:text-primary transition-colors">
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="text-primary" size={24} />
          </div>
        </div>
        <h1 className="font-serif text-3xl text-primary mb-2">Student Portal</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Enter the email address associated with your student record.<br/>
          We'll send you a secure sign-in link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : (
            <>Send sign-in link <ArrowRight size={16} className="ml-2" /></>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-secondary/20 text-center space-y-2">
        <p className="text-xs text-muted-foreground">Only registered students of Kala Kendra Sweden can access this portal.</p>
        <p className="text-xs text-muted-foreground">
          First time?{" "}
          <a href="/portal/register" className="underline hover:text-primary transition-colors font-medium">
            Set up your portal access here
          </a>
        </p>
      </div>
    </div>
  );
}
