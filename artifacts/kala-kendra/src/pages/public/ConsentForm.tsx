import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown, ChevronUp, CheckSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONSENT_ITEMS = [
  {
    id: "photo_video",
    clause: "1",
    label: "I consent to photo and video recording of my participation for the institute's promotional purposes, including social media, website, and printed material.",
  },
  {
    id: "financial",
    clause: "2",
    label: "I accept personal financial responsibility for costumes, accessories, jewellery, makeup, travel, and accommodation costs related to performances and rehearsals.",
  },
  {
    id: "performance",
    clause: "3",
    label: "I confirm my willingness to participate in the annual event/performance, subject to attendance requirements and the institute's casting discretion.",
  },
  {
    id: "creative_direction",
    clause: "4",
    label: "I agree to follow the choreography, formations, styling, and creative direction as decided by the teacher, and acknowledge the intellectual property rights of the institute.",
  },
  {
    id: "attendance",
    clause: "5",
    label: "I understand the minimum attendance requirements for performance eligibility and that my role may be reassigned if I fall below the required threshold.",
  },
  {
    id: "withdrawal",
    clause: "6",
    label: "I understand and accept the withdrawal and refund policy as communicated at the time of enrollment.",
  },
  {
    id: "conduct",
    clause: "7",
    label: "I agree to conduct myself respectfully toward the teacher, fellow participants, and all event staff, and to raise concerns privately with institute management.",
  },
  {
    id: "communication",
    clause: "8",
    label: "I agree to communicate all absences, concerns, and scheduling conflicts directly to the teacher/institute through the designated channel.",
  },
  {
    id: "social_media",
    clause: "9",
    label: "I will not post rehearsal videos, choreography, or behind-the-scenes content on any platform without prior written approval from the institute.",
  },
  {
    id: "liability",
    clause: "10",
    label: "I accept the liability waiver — I participate at my own risk and release the institute, its teachers, and staff from liability for injuries or health issues arising from participation.",
  },
  {
    id: "health",
    clause: "11",
    label: "I confirm I have no undisclosed medical condition that would prevent safe participation, and will inform the institute of any changes to my health.",
  },
];

const CLAUSES = [
  {
    num: "1",
    title: "Photo, Video & Promotional Content Consent",
    text: `I grant the institute permission to photograph and/or video-record my participation in classes, rehearsals, and performances. I consent to the use of this material for the institute's promotional purposes, including but not limited to social media posts, reels, website content, and printed material. I understand that:
a) I will not be compensated for the use of such content.
b) The institute will make reasonable efforts to use content tastefully and respectfully.
c) I may request removal of specific content by written notice, and the institute will make reasonable efforts to comply.`,
  },
  {
    num: "2",
    title: "Expenses & Financial Responsibility",
    text: `I understand and agree that the following expenses are my personal responsibility and are not covered by the institute:
a) Costumes, accessories, jewellery, and makeup for performances.
b) Travel and accommodation costs related to rehearsals or events.
c) Any other expense communicated by the teacher/institute in advance.
I understand the fee structure for the program as communicated at the time of enrollment, and that fees once paid are subject to the refund policy outlined in Clause 6.`,
  },
  {
    num: "3",
    title: "Event / Performance Participation",
    text: `I confirm my interest and willingness to participate in the annual event/performance organized by the institute. I understand that participation is subject to:
a) Meeting the minimum attendance and rehearsal requirements (see Clause 5).
b) Adhering to the creative direction of the teacher (see Clause 4).
c) The institute's final discretion on casting, formations, and performance assignments.`,
  },
  {
    num: "4",
    title: "Creative Direction & Choreography",
    text: `I agree to follow the choreography, formations, styling, and creative direction as decided by the teacher/choreographer. I understand that:
a) Individual modifications or deviations are not permitted without prior approval from the teacher.
b) The choreography taught is the intellectual property of the teacher/institute and may not be reproduced, taught, or shared publicly (including on social media) without written permission.`,
  },
  {
    num: "5",
    title: "Attendance & Rehearsal Commitment",
    text: `I commit to attending all scheduled classes and rehearsals as communicated by the institute. I understand that:
a) A minimum attendance is required to remain eligible for the performance.
b) Absences must be communicated to the teacher in advance (not through other participants).
c) If my attendance falls below the required threshold, the institute reserves the right to reassign my role or remove me from the performance item, without refund of fees.`,
  },
  {
    num: "6",
    title: "Withdrawal & Refund Policy",
    text: `I understand the following withdrawal terms:
a) Withdrawal before a communicated date — full or partial refund of program fees as applicable.
b) Withdrawal after the communicated date — no refund, as costs will have been committed by the institute.
c) In the event of withdrawal, I remain bound by the intellectual property and confidentiality terms of this agreement.`,
  },
  {
    num: "7",
    title: "Code of Conduct",
    text: `I agree to conduct myself respectfully toward the teacher, fellow participants, and any event staff or volunteers. I understand that:
a) Disruptive, disrespectful, or inappropriate behaviour may result in removal from the program without refund.
b) Conflicts or concerns should be raised directly with the teacher or institute management, not discussed publicly or on social media.`,
  },
  {
    num: "8",
    title: "Communication Protocol",
    text: `I agree to communicate any absences, concerns, scheduling conflicts, or issues directly to the teacher/institute through the designated communication channel (e.g., phone, email, or specified group). I will not rely on informal or third-party communication.`,
  },
  {
    num: "9",
    title: "Social Media & Confidentiality",
    text: `I understand the following regarding social media and confidentiality:
a) I will not post rehearsal videos, behind-the-scenes content, or choreography clips on any personal or public platform without the institute's prior written approval.
b) Internal feedback, corrections, group dynamics, or any disputes are confidential and must not be shared publicly.
c) Positive mentions and event promotions are encouraged, in alignment with the institute's branding guidelines.`,
  },
  {
    num: "10",
    title: "Liability Waiver",
    text: `I acknowledge that dance involves physical activity and carries inherent risk of injury. I participate at my own risk and agree that the institute, its teachers, and staff are not liable for any injuries, accidents, or health issues arising from participation in classes, rehearsals, or performances. I confirm that I am in good health and have disclosed any medical conditions that may affect my participation.`,
  },
  {
    num: "11",
    title: "Health Declaration",
    text: `I confirm that I have no medical condition that would prevent safe participation, OR I have disclosed relevant conditions to the institute. I agree to inform the institute of any changes to my health that may impact my participation.`,
  },
  {
    num: "12",
    title: "Minor Participants",
    text: `If the participant is under 18 years of age, all terms of this agreement apply equally. The parent/guardian signing below confirms they have read, understood, and agree to all terms on behalf of the minor participant.`,
  },
];

const formSchema = z.object({
  programName: z.string().min(1, "Program name is required"),
  programYear: z.string().optional(),
  enrollmentDate: z.string().optional(),
  participantName: z.string().min(2, "Full name is required"),
  participantDob: z.string().optional(),
  participantPhone: z.string().optional(),
  participantEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  guardianName: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalConditions: z.string().optional(),
  isMinor: z.boolean(),
  consentItems: z.array(z.string()).min(1, "Please acknowledge at least one clause"),
  signatureName: z.string().min(2, "Signature name is required"),
  guardianSignatureName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function ClauseAccordion({ clause }: { clause: typeof CLAUSES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-secondary/20 bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
            {clause.num}
          </span>
          <span className="font-medium text-sm text-primary">{clause.title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-secondary/10">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{clause.text}</p>
        </div>
      )}
    </div>
  );
}

const inputClass = "rounded-none border-secondary/40 focus-visible:ring-primary bg-background";

export default function ConsentForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const BASE = import.meta.env.BASE_URL;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programName: "",
      programYear: "",
      enrollmentDate: "",
      participantName: "",
      participantDob: "",
      participantPhone: "",
      participantEmail: "",
      guardianName: "",
      emergencyContact: "",
      medicalConditions: "",
      isMinor: false,
      consentItems: [],
      signatureName: "",
      guardianSignatureName: "",
    },
  });

  const isMinor = watch("isMinor");
  const checkedItems = watch("consentItems");

  function toggleConsent(id: string) {
    const current = checkedItems ?? [];
    if (current.includes(id)) {
      setValue("consentItems", current.filter((c) => c !== id), { shouldValidate: true });
    } else {
      setValue("consentItems", [...current, id], { shouldValidate: true });
    }
  }

  function checkAll() {
    setValue("consentItems", CONSENT_ITEMS.map((c) => c.id), { shouldValidate: true });
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}api/consent-forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          enrollmentDate: values.enrollmentDate || null,
          participantDob: values.participantDob || null,
          participantEmail: values.participantEmail || null,
          guardianName: values.guardianName || null,
          emergencyContact: values.emergencyContact || null,
          medicalConditions: values.medicalConditions || null,
          guardianSignatureName: values.guardianSignatureName || null,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("There was an error submitting the form. Please try again or contact the institute.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-700" />
          </div>
          <h2 className="font-serif text-3xl text-primary mb-4">Form Submitted</h2>
          <div className="gold-divider max-w-xs mx-auto" />
          <p className="text-muted-foreground mt-6 mb-2 leading-relaxed">
            Thank you, <strong>{watch("participantName")}</strong>. Your consent form has been received by Kala Kendra Sweden.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Please retain a copy for your records. The institute will be in touch with further details about your programme participation.
          </p>
          <Button
            variant="outline"
            className="rounded-none border-secondary text-primary hover:bg-secondary/10"
            onClick={() => window.print()}
          >
            Print / Save a Copy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-primary-foreground/60 font-semibold mb-4">
          Kala Kendra Sweden · Gothenburg
        </p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Participant Consent Form</h1>
        <div className="h-[1px] w-32 bg-primary-foreground/30 mx-auto mb-4" />
        <p className="text-primary-foreground/70 text-sm max-w-xl mx-auto">
          Terms &amp; Conditions for Performance Participants. Please read all clauses carefully before completing and submitting this form.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto px-6 py-16 space-y-14">

        {/* ── Program Details ────────────────────────────────────────── */}
        <section>
          <div className="border-b border-secondary/20 pb-4 mb-8">
            <h2 className="font-serif text-2xl text-primary">Programme Details</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Programme / Event Name <span className="text-red-500">*</span></Label>
              <Input {...register("programName")} className={inputClass} placeholder="e.g. Bharatanatyam — Annual Arangetram 2025" />
              {errors.programName && <p className="text-xs text-red-500">{errors.programName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Programme Year / Batch</Label>
              <Input {...register("programYear")} className={inputClass} placeholder="e.g. 2024–25 · Batch A" />
            </div>
            <div className="space-y-2">
              <Label>Date of Enrollment</Label>
              <Input type="date" {...register("enrollmentDate")} className={inputClass} />
            </div>
          </div>
        </section>

        {/* ── Participant Details ────────────────────────────────────── */}
        <section>
          <div className="border-b border-secondary/20 pb-4 mb-8">
            <h2 className="font-serif text-2xl text-primary">Participant Details</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input {...register("participantName")} className={inputClass} placeholder="As per official documents" />
              {errors.participantName && <p className="text-xs text-red-500">{errors.participantName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" {...register("participantDob")} className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input type="tel" {...register("participantPhone")} className={inputClass} placeholder="+46 70 000 00 00" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Email Address</Label>
              <Input type="email" {...register("participantEmail")} className={inputClass} placeholder="your@email.com" />
              {errors.participantEmail && <p className="text-xs text-red-500">{errors.participantEmail.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input {...register("emergencyContact")} className={inputClass} placeholder="Name and relationship" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 pt-7">
                <input
                  type="checkbox"
                  id="isMinor"
                  checked={isMinor}
                  onChange={(e) => setValue("isMinor", e.target.checked)}
                  className="w-4 h-4 accent-[#5C1416] cursor-pointer"
                />
                <label htmlFor="isMinor" className="text-sm font-medium cursor-pointer select-none">
                  Participant is under 18 years of age
                </label>
              </div>
            </div>
            {isMinor && (
              <div className="space-y-2 md:col-span-2 bg-amber-50 border border-amber-200 p-5">
                <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-3">Parent / Guardian Details</p>
                <Label>Parent / Guardian Full Name <span className="text-red-500">*</span></Label>
                <Input {...register("guardianName")} className={inputClass} placeholder="Parent or legal guardian" />
              </div>
            )}
          </div>
        </section>

        {/* ── Health Declaration ─────────────────────────────────────── */}
        <section>
          <div className="border-b border-secondary/20 pb-4 mb-8">
            <h2 className="font-serif text-2xl text-primary">Health Declaration</h2>
            <p className="text-muted-foreground text-sm mt-1">
              If you have a medical condition that may affect your participation, please disclose it below. Leave blank if none.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Medical Conditions (if any)</Label>
            <Textarea
              {...register("medicalConditions")}
              className={`${inputClass} min-h-[80px]`}
              placeholder="e.g. Asthma, knee injury, dietary requirements — or leave blank if no relevant conditions."
            />
          </div>
        </section>

        {/* ── Terms & Conditions ────────────────────────────────────── */}
        <section>
          <div className="border-b border-secondary/20 pb-4 mb-6">
            <h2 className="font-serif text-2xl text-primary">Terms &amp; Conditions</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Please expand and read each clause before providing your acknowledgement below.
            </p>
          </div>
          <div className="space-y-2">
            {CLAUSES.map((c) => (
              <ClauseAccordion key={c.num} clause={c} />
            ))}
          </div>
        </section>

        {/* ── Consent Acknowledgement ───────────────────────────────── */}
        <section>
          <div className="border-b border-secondary/20 pb-4 mb-6">
            <h2 className="font-serif text-2xl text-primary">Consent &amp; Acknowledgement</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Please tick each clause you have read and agree to. Multiple items can be selected.
            </p>
          </div>

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={checkAll}
              className="text-xs uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <CheckSquare size={13} />
              Select All
            </button>
          </div>

          <div className="space-y-3">
            {CONSENT_ITEMS.map((item) => {
              const checked = (checkedItems ?? []).includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${
                    checked
                      ? "border-primary/30 bg-primary/5"
                      : "border-secondary/20 bg-card hover:border-secondary/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleConsent(item.id)}
                    className="w-4 h-4 mt-0.5 accent-[#5C1416] shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs uppercase tracking-widest text-secondary font-semibold block mb-1">
                      Clause {item.clause}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{item.label}</p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.consentItems && (
            <div className="mt-3 flex items-center gap-2 text-amber-700 text-sm">
              <AlertCircle size={14} />
              <span>{errors.consentItems.message}</span>
            </div>
          )}
        </section>

        {/* ── Signature ─────────────────────────────────────────────── */}
        <section>
          <div className="border-b border-secondary/20 pb-4 mb-8">
            <h2 className="font-serif text-2xl text-primary">Signature</h2>
            <p className="text-muted-foreground text-sm mt-1">
              By entering your name below, you confirm that you have read and agree to all terms selected above.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label>Participant Full Name (as signature) <span className="text-red-500">*</span></Label>
              <Input
                {...register("signatureName")}
                className={`${inputClass} font-accent text-lg`}
                placeholder="Type your full name"
              />
              {errors.signatureName && <p className="text-xs text-red-500">{errors.signatureName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                readOnly
                className={`${inputClass} bg-muted/30 cursor-not-allowed`}
              />
            </div>

            {isMinor && (
              <>
                <div className="md:col-span-2 h-px bg-secondary/20 my-2" />
                <p className="md:col-span-2 text-xs uppercase tracking-widest text-secondary font-semibold">
                  Parent / Guardian Signature
                </p>
                <div className="space-y-2 md:col-span-2">
                  <Label>Parent / Guardian Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("guardianSignatureName")}
                    className={`${inputClass} font-accent text-lg`}
                    placeholder="Type guardian's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    readOnly
                    className={`${inputClass} bg-muted/30 cursor-not-allowed`}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Submit ────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 px-5 py-4 text-red-800 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <div className="border-t border-secondary/20 pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-12 py-6 text-base"
          >
            {submitting ? "Submitting…" : "Submit Consent Form"}
          </Button>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            Your submission is recorded securely by Kala Kendra Sweden. You may print the confirmation page for your records.
          </p>
        </div>

      </form>
    </div>
  );
}
