import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, BookOpen, Settings, InboxIcon, MessageSquare, CreditCard, CalendarCheck, Megaphone, CalendarDays, ClipboardList, FileCheck, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useListEnquiries, getListEnquiriesQueryKey } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await fetch(`${import.meta.env.BASE_URL}api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
    queryClient.removeQueries({ queryKey: ["admin-me"] });
    navigate("/admin/login");
  };
  const { data: unread = [] } = useListEnquiries({ read: false }, {
    query: { queryKey: getListEnquiriesQueryKey({ read: false }) },
  });
  const unreadCount = unread.length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-secondary/20 bg-card">
          <SidebarHeader className="py-6 px-4 border-b border-secondary/20">
            <h2 className="text-2xl font-serif text-primary">Kala Kendra</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Administration</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/admin/dashboard"}>
                    <Link href="/admin/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/admissions")}>
                    <Link href="/admin/admissions">
                      <InboxIcon />
                      <span>Admissions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/students")}>
                    <Link href="/admin/students">
                      <Users />
                      <span>Students</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/batches")}>
                    <Link href="/admin/batches">
                      <BookOpen />
                      <span>Batches</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/admin/schedule"}>
                    <Link href="/admin/schedule">
                      <CalendarDays />
                      <span>Schedule</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/attendance")}>
                    <Link href="/admin/attendance">
                      <CalendarCheck />
                      <span>Attendance</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/fees")}>
                    <Link href="/admin/fees">
                      <CreditCard />
                      <span>Fees</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/announcements")}>
                    <Link href="/admin/announcements">
                      <Megaphone />
                      <span>Announcements</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/admin/activity-log"}>
                    <Link href="/admin/activity-log">
                      <ClipboardList />
                      <span>Activity Log</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/enquiries")}>
                    <Link href="/admin/enquiries">
                      <MessageSquare />
                      <span>Enquiries</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin/consent-forms")}>
                    <Link href="/admin/consent-forms">
                      <FileCheck />
                      <span>Consent Forms</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-secondary/20">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/admin/settings"}>
                  <Link href="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <span>&larr; Back to Site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-secondary/20 flex items-center px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger />
          </header>
          <div className="p-8 flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
