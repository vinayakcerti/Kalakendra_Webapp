import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import {
  useGetAdmission,
  getGetAdmissionQueryKey,
  useUpdateAdmission,
  useEnrolAdmission,
  getListStudentsQueryKey,
} from "@workspace/api-client-react";

type UpdateAdmissionBodyStatus = "pending" | "under_review" | "accepted" | "waitlisted" | "rejected";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserCheck, ExternalLink } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  accepted: "bg-emerald-100 text-emerald-800",
  waitlisted: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-secondary mb-1">{label}</p>
      <p className="font-medium">{value || <span className="text-muted-foreground italic">—</span>}</p>
    </div>
  );
}

function TextArea({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-secondary mb-2">{label}</p>
      <div className="bg-background border border-secondary/20 p-4 min-h-[80px] whitespace-pre-wrap text-sm">
        {value || <span className="text-muted-foreground italic">None provided</span>}
      </div>
    </div>
  );
}

export default function AdmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: admission, isLoading } = useGetAdmission(id ?? "", {
    query: { queryKey: getGetAdmissionQueryKey(id ?? ""), enabled: !!id },
  });

  const updateAdmission = useUpdateAdmission();
  const enrolAdmission = useEnrolAdmission();
  const [status, setStatus] = useState<UpdateAdmissionBodyStatus | "">("");
  const [notes, setNotes] = useState("");
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (admission && initializedRef.current !== admission.id) {
      initializedRef.current = admission.id;
      setStatus(admission.status as UpdateAdmissionBodyStatus);
      setNotes(admission.adminNotes || "");
    }
  }, [admission]);

  if (isLoading || !admission) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Skeleton className="h-8 w-64 bg-secondary/20" />
        <Skeleton className="h-96 w-full bg-secondary/20" />
      </div>
    );
  }

  const handleUpdate = () => {
    if (!status) return;
    updateAdmission.mutate(
      { id: admission.id, data: { status: status as UpdateAdmissionBodyStatus, adminNotes: notes } },
      {
        onSuccess: (updated) => {
          toast({ title: "Updated successfully" });
          queryClient.setQueryData(getGetAdmissionQueryKey(admission.id), updated);
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const handleEnrol = () => {
    enrolAdmission.mutate(
      { id: admission.id, data: {} },
      {
        onSuccess: (student) => {
          toast({ title: `${student.fullName} enrolled as a student` });
          queryClient.invalidateQueries({ queryKey: getGetAdmissionQueryKey(admission.id) });
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? "Failed to enrol student";
          toast({ title: msg, variant: "destructive" });
        },
      }
    );
  };

  const dob = admission.studentDob ? format(new Date(admission.studentDob), "MMMM d, yyyy") : "—";
  const submittedAt = format(new Date(admission.submittedAt), "MMMM d, yyyy");

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-none hover:bg-secondary/10">
          <Link href="/admin/admissions"><ArrowLeft className="h-5 w-5 text-primary" /></Link>
        </Button>
        <h2 className="text-3xl font-serif text-primary">Admission Details</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Student Info */}
          <div className="bg-card border border-secondary/20 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-serif text-primary mb-1">{admission.studentName}</h3>
                <p className="text-muted-foreground capitalize">{admission.applicantType} applicant · {admission.batch}</p>
              </div>
              <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize px-3 py-1 ${STATUS_STYLES[admission.status] ?? ""}`}>
                {admission.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <Field label="Date of Birth" value={dob} />
              <Field label="Gender" value={admission.studentGender} />
              <Field label="Submitted" value={submittedAt} />
              <Field label="Experience" value={admission.experience} />
              {admission.applicantType === "adult" ? (
                <>
                  <Field label="Email" value={admission.studentEmail} />
                  <Field label="Phone" value={admission.studentPhone} />
                </>
              ) : (
                <>
                  <Field label="Parent / Guardian" value={admission.parentName} />
                  <Field label="Relationship" value={admission.parentRelationship} />
                  <Field label="Parent Email" value={admission.parentEmail} />
                  <Field label="Parent Phone" value={admission.parentPhone} />
                </>
              )}
              <Field label="Emergency Contact" value={admission.emergencyName} />
              <Field label="Emergency Phone" value={admission.emergencyPhone} />
            </div>

            {/* Address */}
            <div className="mb-8 pb-8 border-b border-secondary/10">
              <p className="text-xs uppercase tracking-widest text-secondary mb-2">Address</p>
              <p className="font-medium">{admission.addressStreet}</p>
              <p className="text-muted-foreground">{admission.addressPostal} {admission.addressCity}</p>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Field label="Will Perform on Stage" value={admission.willStagePerform} />
              <Field label="Photo Consent" value={admission.photoConsent} />
              <Field label="Referral Source" value={admission.referralSource} />
            </div>

            <div className="space-y-6">
              <TextArea label="Experience Details" value={admission.experienceDetails} />
              <TextArea label="Motivation" value={admission.motivation} />
              <TextArea label="Medical Notes" value={admission.medicalNotes} />
              <TextArea label="Suggestions" value={admission.suggestions} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrol panel */}
          {admission.enrolledStudentId ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-5 w-5 text-emerald-700" />
                <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Enrolled</p>
              </div>
              <p className="text-sm text-emerald-800 mb-4">
                This applicant has been enrolled as a student.
              </p>
              <Link href={`/admin/students/${admission.enrolledStudentId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-none border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View Student Record
                </Button>
              </Link>
            </div>
          ) : (admission.status === "accepted" || admission.status === "under_review") ? (
            <div className="bg-card border border-secondary/20 p-6">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-5 w-5 text-secondary" />
                <p className="text-xs uppercase tracking-widest text-secondary font-semibold">Enrolment</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {admission.status === "accepted"
                  ? "This application has been accepted. Create the student record to complete enrolment."
                  : "This application is under review. You can pre-enrol the student now."}
              </p>
              <Button
                onClick={handleEnrol}
                disabled={enrolAdmission.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {enrolAdmission.isPending ? "Enrolling…" : "Enrol as Student"}
              </Button>
            </div>
          ) : null}

          {/* Status + notes */}
          <div className="bg-card border border-secondary/20 p-6">
            <h4 className="font-serif text-xl text-primary mb-4">Administration</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-secondary mb-2 block">Update Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as UpdateAdmissionBodyStatus)}>
                  <SelectTrigger className="rounded-none border-secondary/40 focus:ring-primary bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-secondary mb-2 block">Internal Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Private notes about this applicant..."
                  className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background min-h-[150px]"
                />
              </div>
              <Button
                onClick={handleUpdate}
                disabled={
                  updateAdmission.isPending ||
                  (status === admission.status && notes === (admission.adminNotes || ""))
                }
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
              >
                {updateAdmission.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
