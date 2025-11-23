import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { checkIpAccess } from "@/lib/ipCheck";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const ApiKeysPage = lazy(() => import("./pages/ApiKeysPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure React Query with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

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

  // Allowed - show dashboard with Suspense for lazy-loaded routes
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              background: "#0a0a0a",
              color: "#fff",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div>Loading...</div>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/settings/api-keys" element={<ApiKeysPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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
