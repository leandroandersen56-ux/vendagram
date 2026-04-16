import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";
import { useMessageToasts } from "@/hooks/useMessageToasts";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import BottomNav from "@/components/BottomNav";

// Critical routes — loaded eagerly
import Index from "./pages/Index.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";

// Lazy-loaded routes
const TransactionFlow = lazy(() => import("./pages/TransactionFlow.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Favorites = lazy(() => import("./pages/Favorites.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const PanelVerification = lazy(() => import("./pages/panel/PanelVerification.tsx"));
const CreateListingPanel = lazy(() => import("./pages/panel/CreateListingPanel.tsx"));
const EditListingPanel = lazy(() => import("./pages/panel/EditListingPanel.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Purchases = lazy(() => import("./pages/Purchases.tsx"));
const OrderDetail = lazy(() => import("./pages/OrderDetail.tsx"));
const Notifications = lazy(() => import("./pages/Notifications.tsx"));
const Questions = lazy(() => import("./pages/Questions.tsx"));
const Reviews = lazy(() => import("./pages/Reviews.tsx"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard.tsx"));
const WalletPage = lazy(() => import("./pages/WalletPage.tsx"));
const Affiliates = lazy(() => import("./pages/Affiliates.tsx"));
const AmbassadorPage = lazy(() => import("./pages/AmbassadorPage.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));
const HelpPage = lazy(() => import("./pages/HelpPage.tsx"));
const SearchResults = lazy(() => import("./pages/SearchResults.tsx"));
const SellerProfile = lazy(() => import("./pages/SellerProfile.tsx"));
const ViewHistory = lazy(() => import("./pages/ViewHistory.tsx"));
const MyAccesses = lazy(() => import("./pages/MyAccesses.tsx"));
const AuthCallback = lazy(() => import("./pages/AuthCallback.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.tsx"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const EditProfile = lazy(() => import("./pages/settings/EditProfile.tsx"));
const ChangePassword = lazy(() => import("./pages/settings/ChangePassword.tsx"));
const PixKeys = lazy(() => import("./pages/settings/PixKeys.tsx"));
const DeleteAccount = lazy(() => import("./pages/settings/DeleteAccount.tsx"));
const TwoFactorSetup = lazy(() => import("./pages/settings/TwoFactorSetup.tsx"));
const AccessHistory = lazy(() => import("./pages/settings/AccessHistory.tsx"));
const PurchaseProblems = lazy(() => import("./pages/help/PurchaseProblems.tsx"));
const DataNotReceived = lazy(() => import("./pages/help/DataNotReceived.tsx"));
const OpenDispute = lazy(() => import("./pages/help/OpenDispute.tsx"));
const HowEscrowWorks = lazy(() => import("./pages/help/HowEscrowWorks.tsx"));
const WithdrawalsPayments = lazy(() => import("./pages/help/WithdrawalsPayments.tsx"));
const HowToList = lazy(() => import("./pages/help/HowToList.tsx"));

// Partners
const PartnerGuard = lazy(() => import("./pages/partners/PartnerGuard.tsx"));
const PartnerLayout = lazy(() => import("./pages/partners/PartnerLayout.tsx"));
const PartnerDashboard = lazy(() => import("./pages/partners/PartnerDashboard.tsx"));
const PartnerRevenue = lazy(() => import("./pages/partners/PartnerRevenue.tsx"));
const PartnerPerformance = lazy(() => import("./pages/partners/PartnerPerformance.tsx"));
const PartnerWithdrawal = lazy(() => import("./pages/partners/PartnerWithdrawal.tsx"));
const PartnerAccount = lazy(() => import("./pages/partners/PartnerAccount.tsx"));
const PartnerUsers = lazy(() => import("./pages/partners/PartnerUsers.tsx"));

// Super Admin
const SuperAdminGuard = lazy(() => import("./pages/trynda/SuperAdminGuard.tsx"));
const SuperAdminLayout = lazy(() => import("./pages/trynda/SuperAdminLayout.tsx"));
const SuperAdminDashboard = lazy(() => import("./pages/trynda/SuperAdminDashboard.tsx"));
const SuperAdminUsers = lazy(() => import("./pages/trynda/SuperAdminUsers.tsx"));
const SuperAdminListings = lazy(() => import("./pages/trynda/SuperAdminListings.tsx"));
const SuperAdminFinancial = lazy(() => import("./pages/trynda/SuperAdminFinancial.tsx"));
const SuperAdminDisputes = lazy(() => import("./pages/trynda/SuperAdminDisputes.tsx"));
const SuperAdminWithdrawals = lazy(() => import("./pages/trynda/SuperAdminWithdrawals.tsx"));
const SuperAdminNotifications = lazy(() => import("./pages/trynda/SuperAdminNotifications.tsx"));
const SuperAdminEmails = lazy(() => import("./pages/trynda/SuperAdminEmails.tsx"));
const SuperAdminStorage = lazy(() => import("./pages/trynda/SuperAdminStorage.tsx"));
const SuperAdminConfig = lazy(() => import("./pages/trynda/SuperAdminConfig.tsx"));
const SuperAdminSecurity = lazy(() => import("./pages/trynda/SuperAdminSecurity.tsx"));
const SuperAdminOrders = lazy(() => import("./pages/trynda/SuperAdminOrders.tsx"));
const SuperAdminPartners = lazy(() => import("./pages/trynda/SuperAdminPartners.tsx"));

const queryClient = new QueryClient();

function LazyFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, openAuth } = useAuth();
  
  if (isLoading) {
    return <LazyFallback />;
  }
  
  if (!isAuthenticated) {
    openAuth(window.location.pathname);
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function VendedorRedirect() {
  const { identifier, id } = useParams();
  const value = identifier || id;
  return <Navigate to={value ? `/perfil/${value}` : "/marketplace"} replace />;
}

function AppRoutes() {
  useMessageToasts();
  return (
    <>
      <PWAInstallBanner />
      <ScrollToTop />
      <AuthModal />
      <BottomNav />
      
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/anuncio/:id" element={<ListingDetail />} />
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
          <Route path="/perfil/:id" element={<SellerProfile />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
          <Route path="/embaixador" element={<ProtectedRoute><AmbassadorPage /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/configuracoes/perfil" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/configuracoes/senha" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/configuracoes/pix" element={<ProtectedRoute><PixKeys /></ProtectedRoute>} />
          <Route path="/configuracoes/acessos" element={<ProtectedRoute><AccessHistory /></ProtectedRoute>} />
          <Route path="/configuracoes/2fa" element={<ProtectedRoute><TwoFactorSetup /></ProtectedRoute>} />
          <Route path="/configuracoes/excluir" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
          <Route path="/historico" element={<ProtectedRoute><ViewHistory /></ProtectedRoute>} />
          <Route path="/meus-acessos" element={<ProtectedRoute><MyAccesses /></ProtectedRoute>} />

          {/* Seller Dashboard - unified */}
          <Route path="/vendedor" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="/vendedor/novo" element={<ProtectedRoute><CreateListingPanel /></ProtectedRoute>} />
          <Route path="/vendedor/verificacao" element={<ProtectedRoute><PanelVerification /></ProtectedRoute>} />
          <Route path="/vendedor/editar/:id" element={<ProtectedRoute><EditListingPanel /></ProtectedRoute>} />
          <Route path="/vendedor/:identifier" element={<VendedorRedirect />} />

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

          {/* Partners */}
          <Route path="/admintoplogin" element={<PartnerGuard><PartnerLayout /></PartnerGuard>}>
            <Route index element={<PartnerDashboard />} />
            <Route path="faturamento" element={<PartnerRevenue />} />
            <Route path="desempenho" element={<PartnerPerformance />} />
            <Route path="usuarios" element={<PartnerUsers />} />
            <Route path="saque" element={<PartnerWithdrawal />} />
            <Route path="conta" element={<PartnerAccount />} />
          </Route>

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
            <Route path="pedidos-externos" element={<SuperAdminOrders />} />
            <Route path="socios" element={<SuperAdminPartners />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

function AppShell() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;