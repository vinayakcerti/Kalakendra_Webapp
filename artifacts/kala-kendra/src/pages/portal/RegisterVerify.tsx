import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PortalRegisterVerify() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No token found in the link. Please try registering again.");
      return;
    }

    fetch(`${import.meta.env.BASE_URL}api/portal/register/verify?token=${encodeURIComponent(token)}`, {
      credentials: "include",
    })
      .then(async r => {
        if (r.ok) {
          setStatus("ok");
          setTimeout(() => navigate("/portal/dashboard"), 2000);
        } else {
          const data = await r.json().catch(() => ({}));
          setStatus("error");
          setMessage(
            (data as { error?: string }).error === "Token already used"
              ? "This verification link has already been used. Please sign in using your email."
              : (data as { error?: string }).error === "Token expired"
              ? "This verification link has expired. Please register again to get a new one."
              : "Invalid link. Please try registering again."
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
          <p className="text-muted-foreground text-sm">Verifying your email…</p>
        </>
      )}

      {status === "ok" && (
        <>
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={36} />
            </div>
          </div>
          <h2 className="font-serif text-2xl text-primary mb-2">Welcome to the portal</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your email has been verified and your portal account is now active.
            Redirecting you to your dashboard…
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="text-destructive" size={36} />
            </div>
          </div>
          <h2 className="font-serif text-2xl text-primary mb-3">Verification failed</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{message}</p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
              <Link href="/portal/register">Try again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-none">
              <Link href="/portal/login">Sign in instead</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
