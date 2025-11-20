import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import ApiKeysPage from "./pages/ApiKeysPage";
import NotFound from "./pages/NotFound";
import { checkIpAccess } from "@/lib/ipCheck";

const queryClient = new QueryClient();

// Initialize app
const apiBase = import.meta.env.VITE_API_BASE;
if (apiBase) {
  console.log('✅ IRIS Dashboard - API Mode');
  console.log('🔌 API:', apiBase);
}

const AppContent = () => {
  const [ipAllowed, setIpAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    checkIpAccess().then(setIpAllowed);
  }, []);

  // Loading state
  if (ipAllowed === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: '#fff' }}>
        <div>Checking access...</div>
      </div>
    );
  }

  // Blocked state
  if (!ipAllowed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: '#fff', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '48px' }}>🚫</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Access Denied</div>
        <div style={{ color: '#888' }}>Your IP address is not authorized to access this dashboard</div>
      </div>
    );
  }

  // Allowed - show dashboard
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/settings/api-keys" element={<ApiKeysPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
