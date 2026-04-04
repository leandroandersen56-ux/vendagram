import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import TransactionFlow from "./pages/TransactionFlow.tsx";
import Checkout from "./pages/Checkout.tsx";
import Cart from "./pages/Cart.tsx";
import Favorites from "./pages/Favorites.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PanelLayout from "./components/PanelLayout.tsx";
import PanelOverview from "./pages/panel/PanelOverview.tsx";
import PanelListings from "./pages/panel/PanelListings.tsx";
import PanelTransactions from "./pages/panel/PanelTransactions.tsx";
import PanelWallet from "./pages/panel/PanelWallet.tsx";
import PanelNotifications from "./pages/panel/PanelNotifications.tsx";
import PanelProfile from "./pages/panel/PanelProfile.tsx";
import PanelVerification from "./pages/panel/PanelVerification.tsx";
import CreateListingPanel from "./pages/panel/CreateListingPanel.tsx";
import EditListingPanel from "./pages/panel/EditListingPanel.tsx";
import NotFound from "./pages/NotFound.tsx";
import Purchases from "./pages/Purchases.tsx";
import OrderDetail from "./pages/OrderDetail.tsx";
import Notifications from "./pages/Notifications.tsx";
import Questions from "./pages/Questions.tsx";
import Reviews from "./pages/Reviews.tsx";
import SellerCenter from "./pages/SellerCenter.tsx";
import WalletPage from "./pages/WalletPage.tsx";
import Affiliates from "./pages/Affiliates.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import HelpPage from "./pages/HelpPage.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import SellerProfile from "./pages/SellerProfile.tsx";
import ViewHistory from "./pages/ViewHistory.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, openAuth } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    openAuth(window.location.pathname);
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <PWAInstallBanner />
      <ScrollToTop />
      <AuthModal />
      <BottomNav />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/checkout/:listingId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/transaction/:listingId" element={<TransactionFlow />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/busca" element={<SearchResults />} />
        <Route path="/perfil/:username" element={<SellerProfile />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* User pages (protected) */}
        <Route path="/compras" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
        <Route path="/compras/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/notificacoes" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/perguntas" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
        <Route path="/avaliacoes" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/vendedor" element={<ProtectedRoute><SellerCenter /></ProtectedRoute>} />
        <Route path="/carteira" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/afiliados" element={<ProtectedRoute><Affiliates /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/historico" element={<ProtectedRoute><ViewHistory /></ProtectedRoute>} />

        {/* Admin */}
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
