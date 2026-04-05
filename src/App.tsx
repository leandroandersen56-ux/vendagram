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
import PanelVerification from "./pages/panel/PanelVerification.tsx";
import CreateListingPanel from "./pages/panel/CreateListingPanel.tsx";
import EditListingPanel from "./pages/panel/EditListingPanel.tsx";
import NotFound from "./pages/NotFound.tsx";
import Purchases from "./pages/Purchases.tsx";
import OrderDetail from "./pages/OrderDetail.tsx";
import Notifications from "./pages/Notifications.tsx";
import Questions from "./pages/Questions.tsx";
import Reviews from "./pages/Reviews.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import WalletPage from "./pages/WalletPage.tsx";
import Affiliates from "./pages/Affiliates.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import HelpPage from "./pages/HelpPage.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import SellerProfile from "./pages/SellerProfile.tsx";
import ViewHistory from "./pages/ViewHistory.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";

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
        <Route path="/carteira" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/afiliados" element={<ProtectedRoute><Affiliates /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/historico" element={<ProtectedRoute><ViewHistory /></ProtectedRoute>} />

        {/* Seller Dashboard - unified */}
        <Route path="/vendedor" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
        <Route path="/vendedor/novo" element={<ProtectedRoute><CreateListingPanel /></ProtectedRoute>} />
        <Route path="/vendedor/verificacao" element={<ProtectedRoute><PanelVerification /></ProtectedRoute>} />
        <Route path="/vendedor/editar/:id" element={<ProtectedRoute><EditListingPanel /></ProtectedRoute>} />

        {/* Redirects from old panel routes */}
        <Route path="/painel" element={<Navigate to="/vendedor" replace />} />
        <Route path="/painel/anuncios" element={<Navigate to="/vendedor" state={{ tab: "anuncios" }} replace />} />
        <Route path="/painel/anuncios/novo" element={<Navigate to="/vendedor/novo" replace />} />
        <Route path="/painel/anuncios/editar/:id" element={<Navigate to="/vendedor/editar/:id" replace />} />
        <Route path="/painel/transacoes" element={<Navigate to="/vendedor" state={{ tab: "transacoes" }} replace />} />
        <Route path="/painel/carteira" element={<Navigate to="/vendedor" state={{ tab: "carteira" }} replace />} />
        <Route path="/painel/perfil" element={<Navigate to="/vendedor" state={{ tab: "perfil" }} replace />} />
        <Route path="/painel/verificacao" element={<Navigate to="/vendedor/verificacao" replace />} />
        <Route path="/painel/notificacoes" element={<Navigate to="/notificacoes" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<Dashboard />} />

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
