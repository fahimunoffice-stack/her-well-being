 import { Suspense, lazy } from "react";
import { HeroVideo } from "@/components/landing/HeroVideo";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { SeoSchemas } from "@/components/seo/SeoSchemas";

const SalesCopy = lazy(() => import("@/components/landing/SalesCopy").then((m) => ({ default: m.SalesCopy })));
const Reviews = lazy(() => import("@/components/landing/Reviews").then((m) => ({ default: m.Reviews })));
const EbookPreview = lazy(() => import("@/components/landing/EbookPreview").then((m) => ({ default: m.EbookPreview })));
const FAQ = lazy(() => import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })));
const FinalCTA = lazy(() => import("@/components/landing/FinalCTA").then((m) => ({ default: m.FinalCTA })));
const Footer = lazy(() => import("@/components/landing/Footer").then((m) => ({ default: m.Footer })));
 
 // Optimized fallback with minimal layout shift
 const LazyFallback = () => (
   <div className="mx-auto w-full max-w-7xl px-4" style={{ minHeight: '200px' }} />
 );

 const Index = () => {
   return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
       <SeoSchemas />
      <HeroVideo />

      <Suspense
        fallback={<LazyFallback />}
      >
        <SalesCopy />
        <Reviews />
        <EbookPreview />
        <FAQ />
        <FinalCTA />
        <Footer />
      </Suspense>

      <StickyMobileCTA />
    </div>
   );
 };
 
 export default Index;
