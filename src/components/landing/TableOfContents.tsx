 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";
import { useSiteContent } from "@/hooks/useSiteContent";
 
 export const TableOfContents = () => {
  const { data: content } = useSiteContent(true);
  const tocItems = (Array.isArray(content?.table_of_contents)
    ? content?.table_of_contents
    : []) as any[];
 
   return (
     <section className="py-12 md:py-16 bg-background">
       <div className="container mx-auto px-4 max-w-4xl">
         <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">
           ই-বুকটির সূচিপত্র
         </h2>
         <Accordion type="single" collapsible className="w-full space-y-2">
           {tocItems.map((item, idx) => (
             <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4">
               <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary">
                 {item.title}
               </AccordionTrigger>
               <AccordionContent className="text-muted-foreground">
                 {item.desc}
               </AccordionContent>
             </AccordionItem>
           ))}
            {tocItems.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                সূচিপত্র শীঘ্রই যোগ করা হবে।
              </div>
            ) : null}
         </Accordion>
       </div>
     </section>
   );
 };