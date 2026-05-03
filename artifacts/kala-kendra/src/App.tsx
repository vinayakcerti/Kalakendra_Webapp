import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PortalLayout } from "@/components/layout/PortalLayout";

import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Heritage from "@/pages/public/Heritage";
import Programmes from "@/pages/public/Programmes";
import AnnualEvent from "@/pages/public/AnnualEvent";
import Apply from "@/pages/public/Apply";
import Contact from "@/pages/public/Contact";
import Privacy from "@/pages/public/Privacy";
import Classes from "@/pages/public/Classes";
import ConsentForm from "@/pages/public/ConsentForm";

import Dashboard from "@/pages/admin/Dashboard";
import Admissions from "@/pages/admin/Admissions";
import AdmissionDetail from "@/pages/admin/AdmissionDetail";
import Students from "@/pages/admin/Students";
import StudentDetail from "@/pages/admin/StudentDetail";
import Batches from "@/pages/admin/Batches";
import BatchDetail from "@/pages/admin/BatchDetail";
import Fees from "@/pages/admin/Fees";
import Attendance from "@/pages/admin/Attendance";
import Enquiries from "@/pages/admin/Enquiries";
import Settings from "@/pages/admin/Settings";

import Announcements from "@/pages/admin/Announcements";
import Schedule from "@/pages/admin/Schedule";
import ActivityLog from "@/pages/admin/ActivityLog";
import PortalLogin from "@/pages/portal/Login";
import PortalVerify from "@/pages/portal/Verify";
import PortalDashboard from "@/pages/portal/Dashboard";
import PortalFees from "@/pages/portal/Fees";
import PortalAttendance from "@/pages/portal/Attendance";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PublicRoutes() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/heritage" component={Heritage} />
        <Route path="/programmes" component={Programmes} />
        <Route path="/annual-event" component={AnnualEvent} />
        <Route path="/apply" component={Apply} />
        <Route path="/contact" component={Contact} />
        <Route path="/classes" component={Classes} />
        <Route path="/consent" component={ConsentForm} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin">
          <Redirect to="/admin/dashboard" />
        </Route>
        <Route path="/admin/dashboard" component={Dashboard} />
        <Route path="/admin/admissions" component={Admissions} />
        <Route path="/admin/admissions/:id" component={AdmissionDetail} />
        <Route path="/admin/students" component={Students} />
        <Route path="/admin/students/:id" component={StudentDetail} />
        <Route path="/admin/batches/:id" component={BatchDetail} />
        <Route path="/admin/batches" component={Batches} />
        <Route path="/admin/fees" component={Fees} />
        <Route path="/admin/attendance" component={Attendance} />
        <Route path="/admin/enquiries" component={Enquiries} />
        <Route path="/admin/announcements" component={Announcements} />
        <Route path="/admin/schedule" component={Schedule} />
        <Route path="/admin/settings" component={Settings} />
        <Route path="/admin/activity-log" component={ActivityLog} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function PortalRoutes() {
  return (
    <PortalLayout>
      <Switch>
        <Route path="/portal">
          <Redirect to="/portal/dashboard" />
        </Route>
        <Route path="/portal/login" component={PortalLogin} />
        <Route path="/portal/verify" component={PortalVerify} />
        <Route path="/portal/dashboard" component={PortalDashboard} />
        <Route path="/portal/fees" component={PortalFees} />
        <Route path="/portal/attendance" component={PortalAttendance} />
        <Route component={NotFound} />
      </Switch>
    </PortalLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/admin/*" component={AdminRoutes} />
            <Route path="/admin" component={AdminRoutes} />
            <Route path="/portal/*" component={PortalRoutes} />
            <Route path="/portal" component={PortalRoutes} />
            <Route path="/*" component={PublicRoutes} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
