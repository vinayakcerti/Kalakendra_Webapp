import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalVerify() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No token found in the link. Please request a new sign-in link.");
      return;
    }

    fetch(`${(import.meta.env.VITE_API_URL ?? "")}/api/portal/auth/verify?token=${encodeURIComponent(token)}`, {
      credentials: "include",
    })
      .then(async r => {
        if (r.ok) {
          setStatus("ok");
          setTimeout(() => navigate("/portal/dashboard"), 1500);
        } else {
          const data = await r.json().catch(() => ({}));
          setStatus("error");
          setMessage(
            data.error === "Token already used"
              ? "This link has already been used. Please request a new one."
              : data.error === "Token expired"
              ? "This link has expired. Please request a new sign-in link."
              : "Invalid link. Please request a new sign-in link."
          );
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, []);

  return (
    <div className="w-full max-w-sm text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto mb-4 text-primary animate-spin" size={40} />
          <p className="text-muted-foreground text-sm">Verifying your link…</p>
        </>
      )}
      {status === "ok" && (
        <>
          <CheckCircle className="mx-auto mb-4 text-secondary" size={48} />
          <h2 className="font-serif text-2xl text-primary mb-2">Welcome back</h2>
          <p className="text-muted-foreground text-sm">You're signed in. Redirecting to your dashboard…</p>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="mx-auto mb-4 text-destructive" size={48} />
          <h2 className="font-serif text-2xl text-primary mb-3">Link invalid</h2>
          <p className="text-muted-foreground text-sm mb-6">{message}</p>
          <Button variant="outline" onClick={() => navigate("/portal/login")}>
            Back to sign in
          </Button>
        </>
      )}
    </div>
  );
}
