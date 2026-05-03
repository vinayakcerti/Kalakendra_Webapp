import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, CalendarDays, MegaphoneIcon } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  pinned: boolean;
  expiresAt: string | null;
}

const TYPE_CONFIG: Record<string, {
  icon: typeof Info;
  banner: string;
  text: string;
  close: string;
}> = {
  info: {
    icon: Info,
    banner: "bg-blue-50 border-blue-200",
    text: "text-blue-900",
    close: "text-blue-500 hover:text-blue-800",
  },
  event: {
    icon: CalendarDays,
    banner: "bg-amber-50 border-amber-200",
    text: "text-amber-900",
    close: "text-amber-500 hover:text-amber-800",
  },
  closure: {
    icon: MegaphoneIcon,
    banner: "bg-slate-100 border-slate-300",
    text: "text-slate-800",
    close: "text-slate-400 hover:text-slate-700",
  },
  urgent: {
    icon: AlertTriangle,
    banner: "bg-red-50 border-red-300",
    text: "text-red-900",
    close: "text-red-400 hover:text-red-700",
  },
};

const STORAGE_KEY = "kk_dismissed_announcements";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addDismissed(id: string) {
  const current = getDismissed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set([...current, id])]));
}

export function AnnouncementsBanner() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(getDismissed());
    const BASE = import.meta.env.BASE_URL;
    fetch(`${BASE}api/announcements?active=true`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Announcement[]) => setItems(data))
      .catch(() => {});
  }, []);

  const visible = items.filter((a) => !dismissed.includes(a.id));

  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    addDismissed(id);
    setDismissed((prev) => [...prev, id]);
  };

  return (
    <div className="flex flex-col">
      {visible.map((item) => {
        const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info;
        const Icon = cfg.icon;
        return (
          <div
            key={item.id}
            className={`border-b px-4 py-3 flex items-start gap-3 ${cfg.banner}`}
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.text} opacity-70`} />
            <div className={`flex-1 min-w-0 text-sm ${cfg.text}`}>
              <span className="font-semibold mr-2">{item.title}</span>
              <span className="opacity-80">{item.body}</span>
            </div>
            <button
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              className={`shrink-0 mt-0.5 transition-colors ${cfg.close}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
