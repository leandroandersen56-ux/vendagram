import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";
import { useMessageToasts } from "@/hooks/useMessageToasts";
import { useOAuthReturn } from "@/hooks/useOAuthReturn";
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
import EditProfile from "./pages/settings/EditProfile.tsx";
import ChangePassword from "./pages/settings/ChangePassword.tsx";
import PixKeys from "./pages/settings/PixKeys.tsx";
import DeleteAccount from "./pages/settings/DeleteAccount.tsx";
import TwoFactorSetup from "./pages/settings/TwoFactorSetup.tsx";
import AccessHistory from "./pages/settings/AccessHistory.tsx";
import PurchaseProblems from "./pages/help/PurchaseProblems.tsx";
import DataNotReceived from "./pages/help/DataNotReceived.tsx";
import OpenDispute from "./pages/help/OpenDispute.tsx";
import HowEscrowWorks from "./pages/help/HowEscrowWorks.tsx";
import WithdrawalsPayments from "./pages/help/WithdrawalsPayments.tsx";
import HowToList from "./pages/help/HowToList.tsx";

// Super Admin
import SuperAdminGuard from "./pages/trynda/SuperAdminGuard.tsx";
import SuperAdminLayout from "./pages/trynda/SuperAdminLayout.tsx";
import SuperAdminDashboard from "./pages/trynda/SuperAdminDashboard.tsx";
import SuperAdminUsers from "./pages/trynda/SuperAdminUsers.tsx";
import SuperAdminListings from "./pages/trynda/SuperAdminListings.tsx";
import SuperAdminFinancial from "./pages/trynda/SuperAdminFinancial.tsx";
import SuperAdminDisputes from "./pages/trynda/SuperAdminDisputes.tsx";
import SuperAdminWithdrawals from "./pages/trynda/SuperAdminWithdrawals.tsx";
import SuperAdminNotifications from "./pages/trynda/SuperAdminNotifications.tsx";
import SuperAdminEmails from "./pages/trynda/SuperAdminEmails.tsx";
import SuperAdminStorage from "./pages/trynda/SuperAdminStorage.tsx";
import SuperAdminConfig from "./pages/trynda/SuperAdminConfig.tsx";
import SuperAdminSecurity from "./pages/trynda/SuperAdminSecurity.tsx";

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
  useMessageToasts();
  useOAuthReturn();
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
        <Route path="/ajuda/problemas-compra" element={<PurchaseProblems />} />
        <Route path="/ajuda/dados-nao-recebidos" element={<DataNotReceived />} />
        <Route path="/ajuda/abrir-disputa" element={<OpenDispute />} />
        <Route path="/ajuda/escrow" element={<HowEscrowWorks />} />
        <Route path="/ajuda/saques-pagamentos" element={<WithdrawalsPayments />} />
        <Route path="/ajuda/como-anunciar" element={<HowToList />} />
        <Route path="/busca" element={<SearchResults />} />
        <Route path="/perfil/:username" element={<SellerProfile />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/termos" element={<TermsPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/contato" element={<ContactPage />} />

        {/* User pages (protected) */}
        <Route path="/compras" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
        <Route path="/compras/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/notificacoes" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/perguntas" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
        <Route path="/avaliacoes" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/carteira" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/afiliados" element={<ProtectedRoute><Affiliates /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/configuracoes/perfil" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/configuracoes/senha" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/configuracoes/pix" element={<ProtectedRoute><PixKeys /></ProtectedRoute>} />
        <Route path="/configuracoes/acessos" element={<ProtectedRoute><AccessHistory /></ProtectedRoute>} />
        <Route path="/configuracoes/2fa" element={<ProtectedRoute><TwoFactorSetup /></ProtectedRoute>} />
        <Route path="/configuracoes/excluir" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
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

        {/* Super Admin */}
        <Route path="/trynda" element={<SuperAdminGuard><SuperAdminLayout /></SuperAdminGuard>}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="usuarios" element={<SuperAdminUsers />} />
          <Route path="anuncios" element={<SuperAdminListings />} />
          <Route path="financeiro" element={<SuperAdminFinancial />} />
          <Route path="disputas" element={<SuperAdminDisputes />} />
          <Route path="saques" element={<SuperAdminWithdrawals />} />
          <Route path="notificacoes" element={<SuperAdminNotifications />} />
          <Route path="emails" element={<SuperAdminEmails />} />
          <Route path="storage" element={<SuperAdminStorage />} />
          <Route path="config" element={<SuperAdminConfig />} />
          <Route path="seguranca" element={<SuperAdminSecurity />} />
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
