import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import Index from "./pages/Index.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import TransactionFlow from "./pages/TransactionFlow.tsx";
import Checkout from "./pages/Checkout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PanelLayout from "./components/PanelLayout.tsx";
import PanelOverview from "./pages/panel/PanelOverview.tsx";
import PanelListings from "./pages/panel/PanelListings.tsx";
import PanelTransactions from "./pages/panel/PanelTransactions.tsx";
import PanelWallet from "./pages/panel/PanelWallet.tsx";
import PanelNotifications from "./pages/panel/PanelNotifications.tsx";
import PanelProfile from "./pages/panel/PanelProfile.tsx";
import CreateListingPanel from "./pages/panel/CreateListingPanel.tsx";
import EditListingPanel from "./pages/panel/EditListingPanel.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, openAuth } = useAuth();
  if (!isAuthenticated) {
    // Redirect to home and open auth modal
    openAuth(window.location.pathname);
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <AuthModal />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/transaction/:listingId" element={<TransactionFlow />} />

        {/* Admin (will be protected later with role check) */}
        <Route path="/admin" element={<Dashboard />} />

        {/* User panel (protected) */}
        <Route path="/painel" element={<ProtectedRoute><PanelLayout /></ProtectedRoute>}>
          <Route index element={<PanelOverview />} />
          <Route path="anuncios" element={<PanelListings />} />
          <Route path="anuncios/novo" element={<CreateListingPanel />} />
          <Route path="anuncios/editar/:id" element={<EditListingPanel />} />
          <Route path="transacoes" element={<PanelTransactions />} />
          <Route path="carteira" element={<PanelWallet />} />
          <Route path="notificacoes" element={<PanelNotifications />} />
          <Route path="perfil" element={<PanelProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
