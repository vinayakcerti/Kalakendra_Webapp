import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, CreditCard, CalendarCheck, LogOut, ChevronRight, AlertTriangle, Clock, X as XIcon, UserCog } from "lucide-react";
import { differenceInDays, isAfter, parseISO } from "date-fns";

interface PortalStudent {
  id: string;
  fullName: string;
  batchName: string | null;
  batchSchedule: string | null;
  primaryContactEmail: string | null;
  status: string;
  enrolledAt: string;
}

export interface PortalFee {
  id: string;
  description: string;
  amountOre: number;
  currency: string;
  dueDate: string | null;
  paidDate: string | null;
  status: string;
  notes: string | null;
}

interface PortalContextValue {
  student: PortalStudent | null;
  loading: boolean;
  refetch: () => void;
  fees: PortalFee[];
  feesLoading: boolean;
  refetchFees: () => void;
}

const PortalContext = createContext<PortalContextValue>({
  student: null,
  loading: true,
  refetch: () => {},
  fees: [],
  feesLoading: true,
  refetchFees: () => {},
});

export function usePortal() {
  return useContext(PortalContext);
}

function usePortalStudent() {
  const [student, setStudent] = useState<PortalStudent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = () => {
    setLoading(true);
    fetch(`/api/portal/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setStudent(data); setLoading(false); })
      .catch(() => { setStudent(null); setLoading(false); });
  };

  useEffect(() => { fetch_(); }, []);
  return { student, loading, refetch: fetch_ };
}

function usePortalFees(authenticated: boolean) {
  const [fees, setFees] = useState<PortalFee[]>([]);
  const [feesLoading, setFeesLoading] = useState(true);

  const fetch_ = () => {
    if (!authenticated) return;
    setFeesLoading(true);
    fetch(`/api/portal/fees`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then((data: PortalFee[]) => { setFees(data); setFeesLoading(false); })
      .catch(() => { setFees([]); setFeesLoading(false); });
  };

  useEffect(() => { if (authenticated) fetch_(); }, [authenticated]);
  return { fees, feesLoading, refetchFees: fetch_ };
}

function formatSek(ore: number) {
  return (ore / 100).toLocaleString("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });
}

const NAV = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/fees",      label: "Fees",      icon: CreditCard },
  { href: "/portal/attendance",label: "Attendance", icon: CalendarCheck },
  { href: "/portal/profile",   label: "My Details", icon: UserCog },
];

function FeeAlertBanner({ fees, onDismiss }: { fees: PortalFee[]; onDismiss: () => void }) {
  const overdue = fees.filter(f => f.status === "overdue");
  const today = new Date();

  const upcoming = fees.filter(f => {
    if (f.status !== "pending" || !f.dueDate) return false;
    const due = parseISO(f.dueDate);
    const days = differenceInDays(due, today);
    return days >= 0 && days <= 7;
  });

  if (overdue.length === 0 && upcoming.length === 0) return null;

  const isOverdue = overdue.length > 0;
  const items = isOverdue ? overdue : upcoming;
  const total = items.reduce((s, f) => s + f.amountOre, 0);

  if (isOverdue) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={14} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-red-800 font-semibold text-sm">
            {overdue.length === 1
              ? "You have 1 overdue fee"
              : `You have ${overdue.length} overdue fees`}
            {" "}totalling{" "}
            <span className="font-bold">{formatSek(total)}</span>
            {" "}— please settle as soon as possible.
          </span>
          {" "}
          <Link href="/portal/fees">
            <a className="text-red-700 underline underline-offset-2 text-sm font-medium hover:text-red-900 transition-colors">
              View fees →
            </a>
          </Link>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
        >
          <XIcon size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <Clock size={14} className="text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-amber-800 font-semibold text-sm">
          {upcoming.length === 1
            ? "You have 1 fee due within 7 days"
            : `You have ${upcoming.length} fees due within 7 days`}
          {" "}({formatSek(total)}).
        </span>
        {" "}
        <Link href="/portal/fees">
          <a className="text-amber-700 underline underline-offset-2 text-sm font-medium hover:text-amber-900 transition-colors">
            View fees →
          </a>
        </Link>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-amber-400 hover:text-amber-600 transition-colors p-1"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}

export function PortalLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const portalState = usePortalStudent();
  const { student, loading } = portalState;

  const isAuthPage = location === "/portal/login"
    || location.startsWith("/portal/verify")
    || location.startsWith("/portal/register");
  const authenticated = !!student && !isAuthPage;

  const { fees, feesLoading, refetchFees } = usePortalFees(authenticated);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Reset dismissal when fees change so a new overdue fee re-surfaces the banner
  useEffect(() => {
    if (!feesLoading) setAlertDismissed(false);
  }, [feesLoading]);

  const handleLogout = async () => {
    await fetch(`/api/portal/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/portal/login");
  };

  // Redirect to login if not authenticated (except on login/verify pages)
  useEffect(() => {
    if (!loading && !student && !isAuthPage) {
      navigate("/portal/login");
    }
  }, [loading, student, isAuthPage]);

  const contextValue: PortalContextValue = {
    ...portalState,
    fees,
    feesLoading,
    refetchFees,
  };

  if (isAuthPage) {
    return (
      <PortalContext.Provider value={contextValue}>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b border-secondary/20 py-6 px-6 flex items-center justify-between">
            <Link href="/">
              <span className="font-serif text-xl text-primary cursor-pointer hover:text-primary/80 transition-colors">
                Kala Kendra Sweden
              </span>
            </Link>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Student Portal</span>
          </header>
          <main className="flex-1 flex items-center justify-center p-6">
            {children}
          </main>
        </div>
      </PortalContext.Provider>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm tracking-widest uppercase animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!student) return null;

  // Counts for nav badge
  const overdueCount = fees.filter(f => f.status === "overdue").length;
  const today = new Date();
  const upcomingCount = fees.filter(f => {
    if (f.status !== "pending" || !f.dueDate) return false;
    const days = differenceInDays(parseISO(f.dueDate), today);
    return days >= 0 && days <= 7;
  }).length;
  const badgeCount = overdueCount > 0 ? overdueCount : upcomingCount;
  const badgeOverdue = overdueCount > 0;

  return (
    <PortalContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-card border-r border-secondary/20 flex flex-col">
          <div className="px-6 py-7 border-b border-secondary/20">
            <p className="font-serif text-lg text-primary leading-tight">{student.fullName}</p>
            {student.batchName && (
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{student.batchName}</p>
            )}
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = location === href || location.startsWith(href + "/");
              const isFees = href === "/portal/fees";
              return (
                <Link key={href} href={href}>
                  <a className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer ${
                    active
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}>
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                    {isFees && !feesLoading && badgeCount > 0 && (
                      <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shrink-0 ${
                        active
                          ? badgeOverdue
                            ? "bg-red-200 text-red-800"
                            : "bg-amber-200 text-amber-800"
                          : badgeOverdue
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}>
                        {badgeCount > 9 ? "9+" : badgeCount}
                      </span>
                    )}
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-secondary/20 space-y-1">
            <Link href="/">
              <a className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
                <ChevronRight size={16} className="rotate-180" />
                Back to site
              </a>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          <header className="border-b border-secondary/20 flex flex-col sticky top-0 bg-background/95 backdrop-blur z-10">
            <div className="h-14 flex items-center px-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Student Portal</span>
            </div>
            {!feesLoading && !alertDismissed && (
              <FeeAlertBanner fees={fees} onDismiss={() => setAlertDismissed(true)} />
            )}
          </header>
          <div className="flex-1 overflow-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </PortalContext.Provider>
  );
}
