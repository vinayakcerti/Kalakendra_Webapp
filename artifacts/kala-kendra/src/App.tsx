import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Heritage from "@/pages/public/Heritage";
import Programmes from "@/pages/public/Programmes";
import AnnualEvent from "@/pages/public/AnnualEvent";
import Apply from "@/pages/public/Apply";
import Contact from "@/pages/public/Contact";
import Privacy from "@/pages/public/Privacy";

import Dashboard from "@/pages/admin/Dashboard";
import Admissions from "@/pages/admin/Admissions";
import AdmissionDetail from "@/pages/admin/AdmissionDetail";
import Students from "@/pages/admin/Students";
import StudentDetail from "@/pages/admin/StudentDetail";
import Batches from "@/pages/admin/Batches";
import Enquiries from "@/pages/admin/Enquiries";
import Settings from "@/pages/admin/Settings";

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
        <Route path="/admin/batches" component={Batches} />
        <Route path="/admin/enquiries" component={Enquiries} />
        <Route path="/admin/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
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
            <Route path="/*" component={PublicRoutes} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
