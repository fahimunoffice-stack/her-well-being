import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Order from "./pages/Order";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
 import AdminSetup from "./pages/AdminSetup";
import { MetaPixel } from "@/components/tracking/MetaPixel";

// NOTE: Admin panel is intentionally hidden behind a non-guessable path.
// If you want to change it later, update this constant.
const ADMIN_PATH = "/hd-admin-7f3c9a";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MetaPixel />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/order" element={<Order />} />
          {/* Hidden admin routes */}
          <Route path={ADMIN_PATH} element={<AdminLogin />} />
          <Route path={`${ADMIN_PATH}/dashboard/*`} element={<AdminDashboard />} />
          <Route path={`${ADMIN_PATH}/setup`} element={<AdminSetup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
