import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
import logoWhite from "@/assets/logo-froiv-header.png";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PanelOverview from "@/pages/panel/PanelOverview";
import PanelListings from "@/pages/panel/PanelListings";
import PanelOffers from "@/pages/panel/PanelOffers";
import PanelTransactions from "@/pages/panel/PanelTransactions";
import PanelWallet from "@/pages/panel/PanelWallet";
import PanelProfile from "@/pages/panel/PanelProfile";

const TABS = [
  { id: "overview", label: "Visão Geral" },
  { id: "anuncios", label: "Meus Anúncios" },
  { id: "ofertas", label: "Ofertas" },
  { id: "transacoes", label: "Transações" },
  { id: "carteira", label: "Carteira" },
  { id: "perfil", label: "Perfil" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function SellerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialTab = (location.state as any)?.tab ?? "overview";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
    const tab = (location.state as any)?.tab;
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [location.state]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    navigate("/vendedor", { state: { tab }, replace: true });
  };

  const activeLabel = TABS.find(t => t.id === activeTab)?.label || "Painel";

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 sm:pb-0">
      {/* Mobile header */}
      <div className="sm:hidden bg-primary px-4 py-3.5 flex items-center justify-between">
        <img src={logoWhite} alt="Froiv" className="h-6" />
        <button
          onClick={() => handleTabChange("carteira")}
          className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Wallet className="h-5 w-5 text-white" strokeWidth={1.5} />
        </button>
      </div>

      {/* Desktop navbar */}
      <div className="hidden sm:block">
        <Navbar />
      </div>

      {/* Tabs */}
      <div className="sticky top-0 sm:top-14 z-30 bg-white border-b border-[#E8E8E8]">
        <div className="sm:container sm:mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="relative px-5 py-3.5 text-[14px] whitespace-nowrap transition-colors shrink-0"
                style={{
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? "#2D6FF0" : "#888",
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:container sm:mx-auto sm:pt-10 sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <PanelOverview />}
            {activeTab === "anuncios" && <PanelListings />}
            {activeTab === "ofertas" && <PanelOffers />}
            {activeTab === "transacoes" && <PanelTransactions />}
            {activeTab === "carteira" && <PanelWallet />}
            {activeTab === "perfil" && <PanelProfile />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop footer */}
      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
