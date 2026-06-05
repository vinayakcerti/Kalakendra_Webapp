import { useState, useEffect } from "react";
import { usePortal } from "@/components/layout/PortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface ProfileForm {
  fullName: string;
  dob: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
}

export default function PortalProfile() {
  const { student, loading, refetch } = usePortal();
  const { toast } = useToast();

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    dob: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  // Fetch full profile (includes dob, contact fields not in layout context)
  const [fullProfile, setFullProfile] = useState<ProfileForm & { enrolledAt?: string; batchName?: string } | null>(null);

  useEffect(() => {
    fetch(`${(import.meta.env.VITE_API_URL ?? "")}/api/portal/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setFullProfile(data);
        setForm({
          fullName: data.fullName ?? "",
          dob: data.dob ?? "",
          primaryContactName: data.primaryContactName ?? "",
          primaryContactEmail: data.primaryContactEmail ?? "",
          primaryContactPhone: data.primaryContactPhone ?? "",
        });
      });
  }, []);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    if (field === "primaryContactEmail") {
      setEmailChanged(value !== (fullProfile?.primaryContactEmail ?? ""));
    }
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL ?? "")}/api/portal/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          dob: form.dob || null,
          primaryContactName: form.primaryContactName || null,
          primaryContactEmail: form.primaryContactEmail || null,
          primaryContactPhone: form.primaryContactPhone || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to save");
      }

      const updated = await res.json();
      setFullProfile(prev => prev ? { ...prev, ...updated } : updated);
      setSaved(true);
      setEmailChanged(false);
      refetch();
      toast({ title: "Details updated", description: "Your profile has been saved successfully." });
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !fullProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="border border-secondary/20 bg-card p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-6" />
            <div className="space-y-4">
              {[1, 2].map(j => <div key={j} className="h-10 bg-muted rounded" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div className="mb-2">
        <h1 className="font-serif text-3xl text-primary mb-1">My Details</h1>
        <p className="text-muted-foreground text-sm">
          Keep your contact information up to date so the school can reach you.
        </p>
      </div>

      {/* Saved banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
          <CheckCircle2 size={16} className="shrink-0 text-green-600" />
          Your details have been saved successfully.
        </div>
      )}

      {/* Email change warning */}
      {emailChanged && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong>Heads up:</strong> Changing your contact email will also change the email address
            you use to log in to the portal. You will need to use the new address next time you request
            a magic link.
          </p>
        </div>
      )}

      {/* Section 1 — Personal details */}
      <section className="border border-secondary/20 bg-card">
        <div className="px-6 py-4 border-b border-secondary/15 flex items-center gap-3">
          <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0">
            <User size={14} className="text-primary" />
          </div>
          <div>
            <p className="font-serif text-primary text-base leading-tight">Personal Details</p>
            <p className="text-xs text-muted-foreground">Your name and date of birth</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={e => handleChange("fullName", e.target.value)}
              className="rounded-none"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dob" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar size={13} className="text-muted-foreground" />
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={form.dob}
              onChange={e => handleChange("dob", e.target.value)}
              className="rounded-none"
            />
          </div>
        </div>
      </section>

      {/* Section 2 — Contact details */}
      <section className="border border-secondary/20 bg-card">
        <div className="px-6 py-4 border-b border-secondary/15 flex items-center gap-3">
          <div className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0">
            <Mail size={14} className="text-primary" />
          </div>
          <div>
            <p className="font-serif text-primary text-base leading-tight">Contact Information</p>
            <p className="text-xs text-muted-foreground">How the school will reach you (or your guardian)</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="contactName" className="text-sm font-medium text-foreground">
              Contact Person Name
            </Label>
            <Input
              id="contactName"
              value={form.primaryContactName}
              onChange={e => handleChange("primaryContactName", e.target.value)}
              className="rounded-none"
              placeholder="Your name, or parent / guardian name"
            />
            <p className="text-xs text-muted-foreground">Leave as your own name if you are the primary contact.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail size={13} className="text-muted-foreground" />
              Contact Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.primaryContactEmail}
              onChange={e => handleChange("primaryContactEmail", e.target.value)}
              className="rounded-none"
              placeholder="email@example.com"
            />
            <p className="text-xs text-muted-foreground">
              This is also your portal login email — used to send magic links.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone size={13} className="text-muted-foreground" />
              Contact Phone
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              value={form.primaryContactPhone}
              onChange={e => handleChange("primaryContactPhone", e.target.value)}
              className="rounded-none"
              placeholder="+46 70 000 00 00"
            />
          </div>
        </div>
      </section>

      {/* Enrolment info (read-only) */}
      {(fullProfile?.batchName || fullProfile?.enrolledAt) && (
        <section className="border border-secondary/20 bg-card">
          <div className="px-6 py-4 border-b border-secondary/15">
            <p className="font-serif text-primary text-base leading-tight">Enrolment</p>
            <p className="text-xs text-muted-foreground">These details are managed by the school</p>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            {fullProfile.batchName && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Batch</p>
                <p className="text-sm font-medium text-foreground">{fullProfile.batchName}</p>
              </div>
            )}
            {fullProfile.enrolledAt && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Enrolled</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(fullProfile.enrolledAt).toLocaleDateString("sv-SE", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-2 pb-8">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 py-5 gap-2"
        >
          <Save size={15} />
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

    </div>
  );
}
