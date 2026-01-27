import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  FileImage,
  Book,
  Settings,
  ChartColumn,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

// Must match ADMIN_PATH in src/App.tsx
const ADMIN_PATH = "/hd-admin-7f3c9a";

const navItems = [
  { title: "Orders", to: `${ADMIN_PATH}/dashboard`, icon: ShoppingCart, end: true },
  { title: "Analytics", to: `${ADMIN_PATH}/dashboard/analytics`, icon: ChartColumn },
  { title: "Content", to: `${ADMIN_PATH}/dashboard/content`, icon: FileText },
  { title: "Preview Pages", to: `${ADMIN_PATH}/dashboard/pages`, icon: FileImage },
  { title: "Media", to: `${ADMIN_PATH}/dashboard/media`, icon: LayoutDashboard },
  { title: "Ebooks", to: `${ADMIN_PATH}/dashboard/ebooks`, icon: Book },
  { title: "Settings", to: `${ADMIN_PATH}/dashboard/settings`, icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (to: string, end: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <span className="text-sm font-semibold">HD</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">Home Doctor</div>
              <div className="truncate text-xs text-muted-foreground">Admin Dashboard</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.to, item.end ?? false);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className="gap-2 rounded-md px-2.5 py-2 hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
