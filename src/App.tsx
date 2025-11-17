import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { initSupabase } from "@foxruv/agent-learning-core";

const queryClient = new QueryClient();

// Initialize Supabase on app startup
function initializeSupabase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      initSupabase(supabaseUrl, supabaseKey, {
        projectId: 'iris-prime-console',
        tenantId: 'default',
      });
      console.log('✅ Supabase initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
    }
  } else {
    console.warn('⚠️ Supabase credentials not found. Using mock data.');
  }
}

// Call on module load
initializeSupabase();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
