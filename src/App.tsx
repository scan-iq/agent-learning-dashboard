import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize app
const apiBase = import.meta.env.VITE_API_BASE;
if (apiBase) {
  console.log('✅ IRIS Prime Dashboard - API Mode');
  console.log('🔌 API:', apiBase);
}

const AppContent = () => {
  // IP check temporarily disabled - re-enable when needed
  // const [ipAllowed, setIpAllowed] = useState<boolean | null>(null);
  // useEffect(() => {
  //   checkIpAccess().then(setIpAllowed);
  // }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
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
