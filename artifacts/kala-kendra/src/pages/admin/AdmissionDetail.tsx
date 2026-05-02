import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useGetAdmission, getGetAdmissionQueryKey, useUpdateAdmission, UpdateAdmissionBodyStatus } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function AdmissionDetail() {
  const { id } = useParams();
  const admissionId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: admission, isLoading } = useGetAdmission(admissionId, {
    query: { queryKey: getGetAdmissionQueryKey(admissionId), enabled: !!admissionId }
  });

  const updateAdmission = useUpdateAdmission();
  
  const [status, setStatus] = useState<UpdateAdmissionBodyStatus | "">("");
  const [notes, setNotes] = useState("");
  const initializedRef = useRef<number | null>(null);

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

  const formatProgramme = (p: string) => p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleUpdate = () => {
    if (!status) return;
    
    updateAdmission.mutate({
      id: admissionId,
      data: {
        status: status as UpdateAdmissionBodyStatus,
        adminNotes: notes,
      }
    }, {
      onSuccess: (updatedData) => {
        toast({ title: "Updated successfully", description: "Admission record has been saved." });
        queryClient.setQueryData(getGetAdmissionQueryKey(admissionId), updatedData);
      },
      onError: () => {
        toast({ title: "Update failed", description: "Could not save the changes.", variant: "destructive" });
      }
    });
  };

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
          <div className="bg-card border border-secondary/20 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-serif text-primary mb-1">{admission.applicantName}</h3>
                <p className="text-muted-foreground">{admission.email} {admission.phone && `• ${admission.phone}`}</p>
              </div>
              <Badge variant="outline" className={`rounded-none border-secondary/40 capitalize px-3 py-1 text-sm
                ${admission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${admission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                ${admission.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                ${admission.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {admission.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary mb-1">Programme</p>
                <p className="font-medium">{formatProgramme(admission.programme)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary mb-1">Age Group</p>
                <p className="font-medium capitalize">{admission.ageGroup}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary mb-1">Applied On</p>
                <p className="font-medium">{format(new Date(admission.createdAt), "MMMM d, yyyy")}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary mb-2">Experience</p>
                <div className="bg-background border border-secondary/20 p-4 min-h-[80px] whitespace-pre-wrap">
                  {admission.experience || <span className="text-muted-foreground italic">None provided</span>}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary mb-2">Motivation</p>
                <div className="bg-background border border-secondary/20 p-4 min-h-[120px] whitespace-pre-wrap">
                  {admission.motivation || <span className="text-muted-foreground italic">None provided</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
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
                disabled={updateAdmission.isPending || (status === admission.status && notes === (admission.adminNotes || ""))}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
              >
                {updateAdmission.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
