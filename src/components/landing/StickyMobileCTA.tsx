import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export function StickyMobileCTA() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4 py-3">
        <Button
          size="lg"
          className="w-full text-base py-6 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => navigate("/order")}
        >
          ই-বুকটি অর্ডার করতে চাই
        </Button>
      </div>
    </div>
  );
}
