import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Pin, PinOff, Pencil, Trash2, PlusCircle, Megaphone,
  Info, AlertTriangle, CalendarDays, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  pinned: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Info; bar: string; badge: string }> = {
  info:     { label: "Info",     icon: Info,          bar: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  event:    { label: "Event",    icon: CalendarDays,  bar: "bg-secondary",  badge: "bg-amber-50 text-amber-700 border-amber-200" },
  closure:  { label: "Closure",  icon: X,             bar: "bg-slate-400",  badge: "bg-slate-50 text-slate-600 border-slate-200" },
  urgent:   { label: "Urgent",   icon: AlertTriangle, bar: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200" },
};

const EMPTY_FORM = { title: "", body: "", type: "info", pinned: false, expiresAt: "" };

function AnnouncementForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof EMPTY_FORM;
  onSave: (data: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input value={form.title} onChange={e => set("title", e.target.value)} required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label>Message</Label>
        <Textarea
          value={form.body}
          onChange={e => set("body", e.target.value)}
          required
          rows={4}
          placeholder="Write the announcement text…"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Expires on (optional)</Label>
          <Input
            type="date"
            value={form.expiresAt}
            onChange={e => set("expiresAt", e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="pinned-check"
          checked={form.pinned}
          onChange={e => set("pinned", e.target.checked)}
          className="rounded border-secondary/40 accent-primary"
        />
        <Label htmlFor="pinned-check" className="cursor-pointer font-normal">
          Pin this announcement to the top of the student portal
        </Label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <><Loader2 size={14} className="mr-2 animate-spin" />Saving…</> : "Save announcement"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Announcements() {
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);

  const BASE = import.meta.env.BASE_URL;

  const load = () => {
    setLoading(true);
    fetch(`${BASE}api/announcements`)
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setShowDialog(true); };
  const openEdit = (a: Announcement) => {
    setEditing(a);
    setShowDialog(true);
  };

  const handleSave = async (form: typeof EMPTY_FORM) => {
    setSaving(true);
    try {
      const url = editing
        ? `${BASE}api/announcements/${editing.id}`
        : `${BASE}api/announcements`;
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: editing ? "Announcement updated" : "Announcement published" });
      setShowDialog(false);
      load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: Announcement) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    await fetch(`${BASE}api/announcements/${a.id}`, { method: "DELETE" });
    toast({ title: "Announcement removed" });
    load();
  };

  const handleTogglePin = async (a: Announcement) => {
    await fetch(`${BASE}api/announcements/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !a.pinned }),
    });
    load();
  };

  const isExpired = (a: Announcement) =>
    a.expiresAt != null && new Date(a.expiresAt) < new Date(new Date().toDateString());

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-primary">Announcements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Notices shown to students on their portal dashboard
          </p>
        </div>
        <Button onClick={openNew} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0">
          <PlusCircle className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-secondary/30 rounded-lg">
          <Megaphone className="mx-auto mb-4 text-muted-foreground/30" size={40} />
          <p className="font-serif text-xl text-primary mb-1">No announcements yet</p>
          <p className="text-muted-foreground text-sm">
            Create one to display notices on student portal dashboards.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(a => {
            const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG["info"];
            const Icon = cfg.icon;
            const expired = isExpired(a);
            return (
              <div
                key={a.id}
                className={`rounded-lg border border-secondary/20 bg-card overflow-hidden transition-opacity ${expired ? "opacity-50" : ""}`}
              >
                <div className={`h-1 ${cfg.bar}`} />
                <div className="p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {a.pinned && <Pin size={12} className="text-primary shrink-0" />}
                      <p className="font-medium text-sm">{a.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded border ${cfg.badge}`}>{cfg.label}</span>
                      {expired && (
                        <span className="text-xs px-2 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-200">Expired</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-2">{a.body}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                      <span>Published {format(new Date(a.createdAt), "d MMM yyyy")}</span>
                      {a.expiresAt && (
                        <span>· Expires {format(new Date(a.expiresAt), "d MMM yyyy")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => handleTogglePin(a)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      title={a.pinned ? "Unpin" : "Pin to top"}
                    >
                      {a.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => openEdit(a)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => handleDelete(a)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={showDialog} onOpenChange={open => { if (!saving) setShowDialog(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-primary">
              {editing ? "Edit announcement" : "New announcement"}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            initial={
              editing
                ? { title: editing.title, body: editing.body, type: editing.type, pinned: editing.pinned, expiresAt: editing.expiresAt ?? "" }
                : EMPTY_FORM
            }
            onSave={handleSave}
            onCancel={() => setShowDialog(false)}
            saving={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
