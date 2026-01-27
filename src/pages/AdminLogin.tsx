 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { useToast } from "@/hooks/use-toast";
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
   const [loading, setLoading] = useState(true);
   const [formData, setFormData] = useState({ email: "", password: "" });
 
   useEffect(() => {
     // Check existing session
     const checkAuth = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
         // Check if user is admin
         const { data: roles } = await supabase
           .from("user_roles")
           .select("role")
           .eq("user_id", session.user.id);
         
         if (roles?.some(r => r.role === "admin")) {
            navigate(`${ADMIN_PATH}/dashboard`);
         }
       }
       setLoading(false);
     };
     checkAuth();
 
     // Listen to auth changes
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         if (session?.user) {
           const { data: roles } = await supabase
             .from("user_roles")
             .select("role")
             .eq("user_id", session.user.id);
           
           if (roles?.some(r => r.role === "admin")) {
              navigate(`${ADMIN_PATH}/dashboard`);
           }
         }
         setUser(session?.user ?? null);
       }
     );
 
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
 
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Home Doctor</div>
              <CardTitle className="text-center text-2xl tracking-tight">Admin Login</CardTitle>
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