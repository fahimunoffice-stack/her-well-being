 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { useToast } from "@/hooks/use-toast";
 import { z } from "zod";

// Must match ADMIN_PATH in src/App.tsx
const ADMIN_PATH = "/hd-admin-7f3c9a";
 
 const setupSchema = z.object({
   email: z.string().trim().email("Valid email required"),
   password: z.string().min(6, "Password must be at least 6 characters"),
   setupToken: z.string().min(1, "Setup token required"),
 });
 
 const AdminSetup = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
      email: "",
     password: "",
     setupToken: "",
   });
 
   const handleSetup = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const result = setupSchema.safeParse(formData);
     if (!result.success) {
       toast({
         title: "Validation Error",
         description: result.error.errors[0].message,
         variant: "destructive",
       });
       return;
     }
 
     setLoading(true);
 
     try {
       const { data, error } = await supabase.functions.invoke("setup-admin", {
         body: formData,
       });
 
       if (error) throw error;
 
       if (data.error) {
         toast({
           title: "Setup Failed",
           description: data.error,
           variant: "destructive",
         });
         return;
       }
 
       toast({
         title: "Success! 🎉",
         description: "Admin user created. You can now login.",
       });
 
        setTimeout(() => navigate(ADMIN_PATH), 2000);
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message || "Something went wrong",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
    return (
      <div className="admin-theme min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 shadow-2xl">
         <CardHeader>
            <CardTitle className="font-display text-center text-2xl">Admin Setup</CardTitle>
           <CardDescription className="text-center">
             Create your first admin account
           </CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSetup} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password">Password (min 6 chars)</Label>
               <Input
                 id="password"
                 type="password"
                 placeholder="Enter secure password"
                 value={formData.password}
                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="setupToken">Setup Token</Label>
               <Input
                 id="setupToken"
                 type="password"
                 placeholder="Enter ADMIN_SETUP_TOKEN"
                 value={formData.setupToken}
                 onChange={(e) => setFormData({ ...formData, setupToken: e.target.value })}
                 required
               />
             </div>
 
             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? "Creating..." : "Create Admin Account"}
             </Button>
           </form>
 
           <div className="mt-4 text-center">
             <Button variant="link" onClick={() => navigate("/")} className="text-sm">
               ← Back to Home
             </Button>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default AdminSetup;