 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { useToast } from "@/hooks/use-toast";
 import { AdminErrorScreen } from "@/components/admin/AdminErrorScreen";
 import { z } from "zod";

// Must match ADMIN_PATH in src/App.tsx
const ADMIN_PATH = "/hd-admin-7f3c9a";
 
 const loginSchema = z.object({
   email: z.string().trim().email("সঠিক ইমেইল লিখুন"),
   password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
 });
 
 const AdminLogin = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
   const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
   const [formData, setFormData] = useState({ email: "", password: "" });
 
    const checkAuth = async (s: any) => {
      setLoading(true);
      setAuthError(null);
      try {
        const currentSession = s ?? (await supabase.auth.getSession()).data.session;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) return;

        // IMPORTANT: use backend role check (more reliable than selecting user_roles on all devices)
        const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
          _user_id: currentSession.user.id,
          _role: "admin",
        });
        if (roleError) throw roleError;

        if (isAdmin) {
          navigate(`${ADMIN_PATH}/dashboard`);
          return;
        }
      } catch (err: any) {
        console.error("AdminLogin checkAuth failed", err);
        setAuthError(
          err?.message
            ? `সেশন/ব্যাকএন্ড লোড করতে সমস্যা হচ্ছে। (${err.message})`
            : "সেশন/ব্যাকএন্ড লোড করতে সমস্যা হচ্ছে।"
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      // Listen to auth changes (MUST be synchronous)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        // Defer any Supabase calls
        setTimeout(() => {
          checkAuth(nextSession);
        }, 0);
      });

      // Initial load
      checkAuth(null);

      return () => subscription.unsubscribe();
    }, [navigate]);
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     const result = loginSchema.safeParse(formData);
     if (!result.success) {
       toast({
         title: "ভুল তথ্য",
         description: result.error.errors[0].message,
         variant: "destructive",
       });
       return;
     }
 
     const { error } = await supabase.auth.signInWithPassword({
       email: formData.email,
       password: formData.password,
     });
 
     if (error) {
       toast({
         title: "লগইন ব্যর্থ",
         description: "ইমেইল বা পাসওয়ার্ড ভুল",
         variant: "destructive",
       });
     }
   };
 
   if (loading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <p className="text-muted-foreground">লোড হচ্ছে...</p>
       </div>
     );
   }

    if (authError) {
      // Dedicated error screen (instead of only toast)
         return (
        <AdminErrorScreen
          title="Admin session load failed"
          description={authError}
            onRetry={() => checkAuth(session)}
        />
      );
    }
 
    return (
      <div className="admin-theme min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Home Doctor</div>
              <CardTitle className="font-display text-center text-2xl tracking-tight">Admin Login</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
           <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="admin@example.com"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <Input
                 id="password"
                 type="password"
                 placeholder="••••••"
                 value={formData.password}
                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 required
               />
             </div>
 
             <Button type="submit" className="w-full">
               Login
             </Button>
           </form>
 
           <div className="mt-4 text-center">
             <Button variant="link" onClick={() => navigate("/")} className="text-sm">
               ← হোম পেজে ফিরে যান
             </Button>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default AdminLogin;
