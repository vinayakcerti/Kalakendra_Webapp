import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  useListEnquiries,
  useUpdateEnquiry,
  getListEnquiriesQueryKey,
  type Enquiry,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Filter = "all" | "unread" | "read";

const TABS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

export default function Enquiries() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  const params =
    filter === "all"
      ? undefined
      : filter === "unread"
      ? { read: false }
      : { read: true };

  const { data: enquiries = [], isLoading } = useListEnquiries(params, {
    query: { queryKey: getListEnquiriesQueryKey(params) },
  });

  const updateEnquiry = useUpdateEnquiry();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey({ read: false }) });
    queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey({ read: true }) });
    queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
  }

  function toggleRead(enquiry: Enquiry) {
    updateEnquiry.mutate(
      { id: enquiry.id, data: { isRead: !enquiry.isRead } },
      { onSuccess: invalidate }
    );
  }

  function saveNotes(enquiry: Enquiry) {
    setSavingNotes(enquiry.id);
    updateEnquiry.mutate(
      { id: enquiry.id, data: { adminNotes: notes[enquiry.id] ?? enquiry.adminNotes ?? "" } },
      {
        onSuccess: () => {
          setSavingNotes(null);
          invalidate();
        },
        onError: () => setSavingNotes(null),
      }
    );
  }

  function handleExpand(enquiry: Enquiry) {
    const isOpening = expanded !== enquiry.id;
    setExpanded(isOpening ? enquiry.id : null);

    if (isOpening) {
      if (notes[enquiry.id] === undefined) {
        setNotes((prev) => ({ ...prev, [enquiry.id]: enquiry.adminNotes ?? "" }));
      }
      if (!enquiry.isRead) {
        updateEnquiry.mutate(
          { id: enquiry.id, data: { isRead: true } },
          { onSuccess: invalidate }
        );
      }
    }
  }

  const unreadCount = enquiries.filter((e) => !e.isRead).length;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-primary">Enquiries</h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground text-sm mt-1">
              {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-secondary/20">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setFilter(tab.value); setExpanded(null); }}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
              filter === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground">Loading…</div>
      ) : enquiries.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground border border-secondary/20">
          <p className="font-serif text-xl text-primary mb-2">No enquiries found</p>
          <p className="text-sm">
            {filter === "unread" ? "All messages have been read." : "No messages yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {enquiries.map((enquiry) => {
            const isOpen = expanded === enquiry.id;
            return (
              <div
                key={enquiry.id}
                className={`border transition-colors ${
                  !enquiry.isRead
                    ? "border-secondary/50 bg-secondary/5"
                    : "border-secondary/20 bg-card"
                } ${isOpen ? "border-secondary/60" : "hover:border-secondary/40"}`}
              >
                {/* Row header */}
                <button
                  className="w-full text-left px-6 py-4 flex items-start gap-4"
                  onClick={() => handleExpand(enquiry)}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {!enquiry.isRead ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-transparent border border-secondary/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`font-medium text-sm ${!enquiry.isRead ? "text-primary" : "text-foreground"}`}>
                        {enquiry.name}
                      </span>
                      <span className="text-muted-foreground text-xs">{enquiry.email}</span>
                      {!enquiry.isRead && (
                        <Badge className="bg-primary/10 text-primary text-xs border border-primary/20 rounded-none">
                          Unread
                        </Badge>
                      )}
                      {enquiry.adminNotes && (
                        <Badge variant="outline" className="text-xs rounded-none border-secondary/30 text-muted-foreground">
                          Has notes
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${!enquiry.isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {enquiry.subject}
                    </p>
                    {!isOpen && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xl">
                        {enquiry.message}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground shrink-0 text-right">
                    <p>{format(new Date(enquiry.createdAt), "d MMM yyyy")}</p>
                    <p className="mt-0.5">{format(new Date(enquiry.createdAt), "HH:mm")}</p>
                  </div>
                </button>

                {/* Expanded panel */}
                {isOpen && (
                  <div className="border-t border-secondary/20 px-6 pb-6 pt-4">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: message */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                          Message
                        </p>
                        <div className="bg-background border border-secondary/20 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-6">
                          {enquiry.message}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={`mailto:${enquiry.email}?subject=Re: ${encodeURIComponent(enquiry.subject)}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            ✉ Reply by Email
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-none border-secondary/40 text-sm"
                            onClick={() => toggleRead(enquiry)}
                            disabled={updateEnquiry.isPending}
                          >
                            {enquiry.isRead ? "Mark as Unread" : "Mark as Read"}
                          </Button>
                        </div>
                      </div>

                      {/* Right: meta + notes */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
                          Details
                        </p>
                        <div className="space-y-3 mb-6">
                          {[
                            { label: "From", value: enquiry.name },
                            { label: "Email", value: enquiry.email },
                            { label: "Subject", value: enquiry.subject },
                            { label: "Received", value: format(new Date(enquiry.createdAt), "d MMM yyyy, HH:mm") },
                            { label: "Status", value: enquiry.isRead ? "Read" : "Unread" },
                          ].map((row) => (
                            <div key={row.label} className="flex gap-3 text-sm border-b border-secondary/10 pb-3">
                              <span className="w-20 shrink-0 text-muted-foreground">{row.label}</span>
                              <span className="text-foreground break-all">{row.value}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">
                          Admin Notes
                        </p>
                        <Textarea
                          value={notes[enquiry.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [enquiry.id]: e.target.value }))
                          }
                          placeholder="Internal notes (not visible to the sender)…"
                          className="rounded-none border-secondary/40 focus-visible:ring-primary bg-background min-h-[100px] text-sm resize-none mb-3"
                        />
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                          onClick={() => saveNotes(enquiry)}
                          disabled={savingNotes === enquiry.id}
                        >
                          {savingNotes === enquiry.id ? "Saving…" : "Save Notes"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
