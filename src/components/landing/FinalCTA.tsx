 import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
 
 export const FinalCTA = () => {
   const navigate = useNavigate();
 
   return (
    <section className="py-12 md:py-24 bg-gradient-to-b from-secondary to-background">
       <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 text-foreground">
           এখনই অর্ডার করুন
         </h2>
        <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
           আপনার স্বাস্থ্য এবং জীবনের জন্য এই বিনিয়োগ করুন। মাত্র ২৮০ টাকায় পেয়ে যান অমূল্য তথ্যভাণ্ডার।
         </p>
         <Button
           size="lg"
           onClick={() => navigate("/order")}
          className="w-full sm:w-auto text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 shadow-2xl hover:shadow-xl transition-all animate-pulse"
         >
           ই-বুকটি অর্ডার করতে চাই
         </Button>
       </div>
     </section>
   );
 };