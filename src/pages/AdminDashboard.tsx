import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { OrdersPage } from "@/components/admin/orders/OrdersPage";
import { ContentPage } from "@/components/admin/content/ContentPage";
import { PreviewPagesPage } from "@/components/admin/content/PreviewPagesPage";
import { MediaPage } from "@/components/admin/media/MediaPage";
import { EbooksManager } from "@/components/admin/ebooks/EbooksManager";
import { AdminSettingsPage } from "@/components/admin/settings/AdminSettingsPage";
import { AdminAnalyticsPage } from "@/components/admin/analytics/AdminAnalyticsPage";
import { LogOut } from "lucide-react";

// Must match ADMIN_PATH in src/App.tsx
const ADMIN_PATH = "/hd-admin-7f3c9a";
 
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate(ADMIN_PATH);
        return;
      }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);

      if (!roles?.some((r) => r.role === "admin")) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUser(session.user);
      setIsAdmin(true);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) navigate(ADMIN_PATH);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);
 
  const title = useMemo(() => {
    const p = location.pathname;
    if (p.includes("/analytics")) return "Analytics";
    if (p.includes("/content")) return "Content";
    if (p.includes("/pages")) return "Preview Pages";
    if (p.includes("/media")) return "Media";
    if (p.includes("/ebooks")) return "Ebooks";
    if (p.includes("/settings")) return "Settings";
    return "Orders";
  }, [location.pathname]);
 
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(ADMIN_PATH);
  };
 
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin || !user) return null;

  return (
    <AdminShell
      title={title}
      actions={
        <>
          <Button onClick={handleLogout} variant="outline" size="sm" className="hidden sm:inline-flex">
            Logout
          </Button>
          <Button onClick={handleLogout} variant="outline" size="icon" className="sm:hidden" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <Routes>
        <Route index element={<OrdersPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="pages" element={<PreviewPagesPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="ebooks" element={<EbooksManager />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Routes>
    </AdminShell>
  );
};
 
 export default AdminDashboard;