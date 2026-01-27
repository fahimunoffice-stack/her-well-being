 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";
import { useSiteContent } from "@/hooks/useSiteContent";
 
 export const FAQ = () => {
  const { data: content } = useSiteContent(true);
  const faqs = (Array.isArray(content?.faq) ? content?.faq : []) as any[];
 
   return (
     <section className="py-12 md:py-16 bg-background">
       <div className="container mx-auto px-4 max-w-4xl">
         <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">
           সাধারণ প্রশ্নের উত্তর
         </h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
           {faqs.map((faq, idx) => (
             <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-4">
               <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary">
                 {faq.question}
               </AccordionTrigger>
               <AccordionContent className="text-muted-foreground">
                 {faq.answer}
               </AccordionContent>
             </AccordionItem>
           ))}
            {faqs.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                FAQ শীঘ্রই যোগ করা হবে।
              </div>
            ) : null}
         </Accordion>
       </div>
     </section>
   );
 };