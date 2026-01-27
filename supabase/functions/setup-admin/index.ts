 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
 };
 
 interface SetupRequest {
   email: string;
   password: string;
   setupToken: string;
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { email, password, setupToken }: SetupRequest = await req.json();
 
     // Validate setup token
     const ADMIN_SETUP_TOKEN = Deno.env.get("ADMIN_SETUP_TOKEN");
     if (!ADMIN_SETUP_TOKEN || setupToken !== ADMIN_SETUP_TOKEN) {
       return new Response(
         JSON.stringify({ error: "Invalid setup token" }),
         { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Validate inputs
     if (!email || !password || password.length < 6) {
       return new Response(
         JSON.stringify({ error: "Invalid email or password (min 6 chars)" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create Supabase admin client
     const supabaseAdmin = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
       { auth: { autoRefreshToken: false, persistSession: false } }
     );
 
     // Create user
     const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
       email,
       password,
       email_confirm: true,
     });
 
     if (userError) throw userError;
 
     // Assign admin role
     const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
       user_id: userData.user.id,
       role: "admin",
     });
 
     if (roleError) throw roleError;
 
     return new Response(
       JSON.stringify({ success: true, message: "Admin user created successfully" }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error: any) {
     console.error("Setup admin error:", error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });