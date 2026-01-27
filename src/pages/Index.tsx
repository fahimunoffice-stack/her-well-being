 import { HeroVideo } from "@/components/landing/HeroVideo";
 import { SalesCopy } from "@/components/landing/SalesCopy";
 import { Reviews } from "@/components/landing/Reviews";
 import { TableOfContents } from "@/components/landing/TableOfContents";
 import { EbookPreview } from "@/components/landing/EbookPreview";
 import { FAQ } from "@/components/landing/FAQ";
 import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
 
 const Index = () => {
   return (
      <div className="min-h-screen bg-background pb-24 md:pb-0">
       <HeroVideo />
       <SalesCopy />
       <Reviews />
       <TableOfContents />
       <EbookPreview />
       <FAQ />
       <FinalCTA />
        <Footer />
        <StickyMobileCTA />
     </div>
   );
 };
 
 export default Index;
