import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, CreditCard, CalendarCheck, LogOut, ChevronRight } from "lucide-react";

interface PortalStudent {
  id: string;
  fullName: string;
  batchName: string | null;
  batchSchedule: string | null;
  primaryContactEmail: string | null;
  status: string;
  enrolledAt: string;
}

interface PortalContextValue {
  student: PortalStudent | null;
  loading: boolean;
  refetch: () => void;
}

const PortalContext = createContext<PortalContextValue>({ student: null, loading: true, refetch: () => {} });

export function usePortal() {
  return useContext(PortalContext);
}

function usePortalStudent() {
  const [student, setStudent] = useState<PortalStudent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = () => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/portal/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setStudent(data); setLoading(false); })
      .catch(() => { setStudent(null); setLoading(false); });
  };

  useEffect(() => { fetch_(); }, []);
  return { student, loading, refetch: fetch_ };
}

const NAV = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/fees",      label: "Fees",      icon: CreditCard },
  { href: "/portal/attendance",label: "Attendance", icon: CalendarCheck },
];

export function PortalLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const portalState = usePortalStudent();
  const { student, loading } = portalState;

  const handleLogout = async () => {
    await fetch(`${import.meta.env.BASE_URL}api/portal/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/portal/login");
  };

  // Redirect to login if not authenticated (except on login/verify pages)
  const isAuthPage = location === "/portal/login" || location.startsWith("/portal/verify");
  useEffect(() => {
    if (!loading && !student && !isAuthPage) {
      navigate("/portal/login");
    }
  }, [loading, student, isAuthPage]);

  if (isAuthPage) {
    return (
      <PortalContext.Provider value={portalState}>
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

  return (
    <PortalContext.Provider value={portalState}>
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
              return (
                <Link key={href} href={href}>
                  <a className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer ${
                    active
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}>
                    <Icon size={16} />
                    {label}
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
          <header className="h-14 border-b border-secondary/20 flex items-center px-8 sticky top-0 bg-background/95 backdrop-blur z-10">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Student Portal</span>
          </header>
          <div className="flex-1 overflow-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </PortalContext.Provider>
  );
}
