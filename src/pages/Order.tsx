import { useCallback, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { useQuery, useMutation } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { useToast } from "@/hooks/use-toast";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
 import { z } from "zod";
 import { Copy } from "lucide-react";
 
 const orderSchema = z.object({
   name: z.string().trim().min(1, "নাম লিখুন").max(100),
   mobile: z.string().trim().min(11, "সঠিক মোবাইল নম্বর লিখুন").max(20),
   sender_bkash: z.string().trim().min(11, "bKash নম্বর লিখুন").max(20),
 });
 
 const Order = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
  const keyboardInset = useKeyboardInset();
   const [formData, setFormData] = useState({
     name: "",
     mobile: "",
     sender_bkash: "",
   });
   const [submitted, setSubmitted] = useState(false);

  const scrollFocusedIntoView = useCallback((e: React.FocusEvent<HTMLElement>) => {
    // Let the browser finish focusing first
    window.setTimeout(() => {
      try {
        e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        // ignore
      }
    }, 50);
  }, []);

  const inputClassName = "h-12 text-base";
 
   const { data: content } = useQuery({
     queryKey: ["site-content"],
     queryFn: async () => {
       const { data, error } = await supabase.from("site_content").select("*");
       if (error) throw error;
       const mapped: Record<string, any> = {};
       data?.forEach((item) => {
         mapped[item.key] = item.value;
       });
       return mapped;
     },
   });
 
   const price = content?.price || "280";
   const bkashNumber = content?.bkash_number || "01XXXXXXXXX";

    const copyBkash = async () => {
      try {
        await navigator.clipboard.writeText(String(bkashNumber));
        toast({ title: "কপি হয়েছে", description: "bKash নম্বর কপি করা হয়েছে।" });
      } catch {
        toast({ title: "কপি হয়নি", description: "আবার চেষ্টা করুন।", variant: "destructive" });
      }
    };
 
   const submitOrder = useMutation({
     mutationFn: async (data: typeof formData) => {
       const { error } = await supabase.from("orders").insert([
         {
           name: data.name,
           mobile: data.mobile,
           sender_bkash: data.sender_bkash,
           status: "pending",
          user_id: null,
         },
       ]);
       if (error) throw error;
     },
     onSuccess: () => {
       setSubmitted(true);
       toast({
         title: "অর্ডার সফল!",
         description: "আপনার অর্ডার রিসিভ হয়েছে। শীঘ্রই ভেরিফাই করা হবে।",
       });
     },
     onError: () => {
       toast({
         title: "সমস্যা হয়েছে",
         description: "আবার চেষ্টা করুন।",
         variant: "destructive",
       });
     },
   });
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     const result = orderSchema.safeParse(formData);
     if (!result.success) {
       toast({
         title: "ভুল তথ্য",
         description: result.error.errors[0].message,
         variant: "destructive",
       });
       return;
     }
     submitOrder.mutate(formData);
   };
 
   if (submitted) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center p-4">
         <Card className="max-w-md w-full shadow-2xl">
           <CardHeader>
             <CardTitle className="text-center text-2xl text-primary">
               অর্ডার সফল হয়েছে! ✓
             </CardTitle>
           </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
               আপনার অর্ডার রিসিভ হয়েছে। আমরা ২৪ ঘণ্টার মধ্যে ভেরিফাই করে আপনার WhatsApp/Mobile এ ই-বুক পাঠিয়ে দেব।
             </p>
             <Button onClick={() => navigate("/")} variant="outline" className="w-full">
               হোম পেজে ফিরে যান
             </Button>
           </CardContent>
         </Card>
       </div>
     );
   }
 
    return (
       <div
         className="min-h-svh bg-gradient-to-b from-secondary to-background py-6 md:py-12 px-4"
        style={{ paddingBottom: keyboardInset ? keyboardInset + 24 : undefined }}
      >
       <div className="container mx-auto max-w-lg">
         <Card className="shadow-2xl">
           <CardHeader className="text-center space-y-2">
             <div className="text-3xl font-bold text-primary">Home Doctor</div>
             <CardTitle className="text-2xl">অর্ডার ফর্ম</CardTitle>
           </CardHeader>
            <CardContent className="space-y-5 md:space-y-6">
             {/* Payment instructions */}
              <div className="bg-secondary/50 p-3 md:p-4 rounded-lg space-y-2">
               <p className="font-semibold text-foreground">পেমেন্ট নির্দেশনা:</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                 প্রথমে নিচের bKash নম্বরে <span className="font-bold text-primary">{price} টাকা</span> পাঠান:
               </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                  <p className="text-lg md:text-xl font-bold text-center sm:text-left text-primary break-all flex-1">
                    {bkashNumber}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyBkash}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy bKash Number
                  </Button>
                </div>
               <p className="text-xs text-muted-foreground text-center">
                 (Send Money করুন এবং তারপর নিচের ফর্ম পূরণ করুন)
               </p>
             </div>
 
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                 <div className="space-y-1.5 md:space-y-2">
                 <Label htmlFor="name">নাম *</Label>
                 <Input
                   id="name"
                   type="text"
                   placeholder="আপনার নাম লিখুন"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={scrollFocusedIntoView}
                    className={inputClassName}
                    autoComplete="name"
                   required
                 />
               </div>
 
                 <div className="space-y-1.5 md:space-y-2">
                 <Label htmlFor="mobile">WhatsApp / Mobile Number *</Label>
                 <Input
                   id="mobile"
                   type="tel"
                   placeholder="01XXXXXXXXX"
                   value={formData.mobile}
                   onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    onFocus={scrollFocusedIntoView}
                    className={inputClassName}
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                   required
                 />
               </div>
 
                 <div className="space-y-1.5 md:space-y-2">
                 <Label htmlFor="sender_bkash">যে bKash নম্বর থেকে টাকা পাঠিয়েছেন *</Label>
                 <Input
                   id="sender_bkash"
                   type="tel"
                   placeholder="01XXXXXXXXX"
                   value={formData.sender_bkash}
                   onChange={(e) => setFormData({ ...formData, sender_bkash: e.target.value })}
                    onFocus={scrollFocusedIntoView}
                    className={inputClassName}
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="done"
                   required
                 />
               </div>
 
               <Button
                 type="submit"
                  className="w-full text-base md:text-lg py-5 md:py-6 touch-manipulation"
                 disabled={submitOrder.isPending}
               >
                 {submitOrder.isPending ? "সাবমিট হচ্ছে..." : "Submit"}
               </Button>
             </form>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 };
 
 export default Order;