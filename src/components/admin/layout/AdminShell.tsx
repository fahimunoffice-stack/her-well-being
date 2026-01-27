import * as React from "react";
import { useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { useSidebar } from "@/components/ui/sidebar";

export function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen>
      <AdminShellInner title={title} actions={actions} locationKey={location.key}>
        {children}
      </AdminShellInner>
    </SidebarProvider>
  );
}

function AdminShellInner({
  title,
  actions,
  children,
  locationKey,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  locationKey: string;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  // Mobile UX: navigation এর পর sidebar auto-close
  React.useEffect(() => {
    if (!isMobile) return;
    setOpenMobile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey]);

  return (
    <div className="admin-theme flex min-h-svh w-full overflow-x-hidden">
      <AdminSidebar />

      <SidebarInset className="min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b bg-background/80 px-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground md:text-lg">{title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </header>

        <div className="mx-auto w-full max-w-7xl overflow-x-hidden p-3 md:p-6">
          <div className="animate-fade-in">{children}</div>
        </div>
      </SidebarInset>
    </div>
  );
}
