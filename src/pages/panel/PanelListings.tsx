import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, MoreVertical, Edit, Pause, Play, Trash2, Eye,
  Copy, ChevronRight, Tag, SearchX, Loader2, BarChart3, Heart,
  ExternalLink, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatBRL, PLATFORMS } from "@/lib/mock-data";
import PlatformIcon from "@/components/PlatformIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type ListingRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  status: string;
  screenshots: string[] | null;
  created_at: string;
  views_count: number;
};

type FilterId = "todos" | "ativos" | "rascunhos" | "vendidos";

const FILTERS: { id: FilterId; label: string; dbStatus?: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ativos", label: "Ativos", dbStatus: "active" },
  { id: "rascunhos", label: "Rascunhos", dbStatus: "draft" },
  { id: "vendidos", label: "Vendidos", dbStatus: "sold" },
];

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: "Ativo", bg: "bg-[#E8F8EF]", text: "text-[#00A650]", dot: "bg-[#00A650]" },
  draft: { label: "Rascunho", bg: "bg-[#F5F5F5]", text: "text-[#888]", dot: "bg-[#888]" },
  sold: { label: "Vendido", bg: "bg-[#E8F0FF]", text: "text-[#2D6FF0]", dot: "bg-[#2D6FF0]" },
  removed: { label: "Removido", bg: "bg-[#FEE]", text: "text-[#E53935]", dot: "bg-[#E53935]" },
};

const PLATFORM_GRADIENTS: Record<string, string> = {
  instagram: "linear-gradient(135deg,#833AB4,#E1306C,#F77737)",
  tiktok: "linear-gradient(135deg,#010101,#69C9D0)",
  youtube: "linear-gradient(135deg,#CC0000,#FF4444)",
  facebook: "linear-gradient(135deg,#0D5FBF,#1877F2)",
  free_fire: "linear-gradient(135deg,#CC4400,#FF6B00)",
  valorant: "linear-gradient(135deg,#BD3944,#FF4655)",
  fortnite: "linear-gradient(135deg,#1048CC,#1F69FF)",
  roblox: "linear-gradient(135deg,#B31A12,#E2231A)",
  clash_royale: "linear-gradient(135deg,#0088CC,#00ADEF)",
  other: "linear-gradient(135deg,#4B5563,#6B7280)",
};

function getQuality(listing: ListingRow) {
  const hasPhoto = listing.screenshots && listing.screenshots.length > 0;
  const longTitle = listing.title.length > 40;
  const hasDesc = !!listing.description && listing.description.length > 20;
  if (hasPhoto && longTitle && hasDesc) return { level: "Profissional", color: "#00A650" };
  if (hasPhoto && (longTitle || hasDesc)) return { level: "Bom", color: "#FF8C00" };
  return { level: "Básico", color: "#E53935" };
}

function getPlatformName(category: string) {
  const p = PLATFORMS.find((pl) => pl.id === category);
  return p?.name || category;
}

function shortId(id: string) {
  return "FRV-" + id.substring(0, 6).toUpperCase();
}

// ─── Bottom Sheet ───
function ActionSheet({
  listing,
  onClose,
  onEdit,
  onToggle,
  onDelete,
  onView,
}: {
  listing: ListingRow;
  onClose: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const st = STATUS_BADGE[listing.status] || STATUS_BADGE.draft;
  const thumb = listing.screenshots?.[0];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg bg-white rounded-t-[20px] pb-8"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#E0E0E0]" />
        </div>

        {/* Mini header */}
        <div className="flex items-center gap-3 px-5 pb-4 border-b border-[#F0F0F0]">
          {thumb ? (
            <img src={thumb} className="w-10 h-10 rounded-lg object-cover" alt="" />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: PLATFORM_GRADIENTS[listing.category] || PLATFORM_GRADIENTS.other }}
            >
              <PlatformIcon platformId={listing.category} size={20} className="brightness-0 invert" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#111] truncate">{listing.title}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${st.bg} ${st.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5F5F5]">
            <X className="w-4 h-4 text-[#999]" />
          </button>
        </div>

        {/* Actions */}
        <div className="py-1">
          <SheetAction icon={Edit} label="Editar anúncio" onClick={onEdit} />
          {listing.status === "active" ? (
            <SheetAction icon={Pause} label="Pausar anúncio" onClick={onToggle} />
          ) : listing.status === "draft" ? (
            <SheetAction icon={Play} label="Ativar anúncio" onClick={onToggle} />
          ) : null}
          <SheetAction icon={ExternalLink} label="Ver na loja" onClick={onView} />

          <div className="h-px bg-[#F0F0F0] mx-5 my-1" />

          <SheetAction icon={Trash2} label="Excluir anúncio" onClick={onDelete} danger />
        </div>
      </motion.div>
    </motion.div>
  );
}

function SheetAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-5 py-3.5 gap-4 transition-colors ${
        danger ? "text-[#E53935] hover:bg-red-50" : "text-[#333] hover:bg-[#F8F8F8]"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[14px] font-medium flex-1 text-left">{label}</span>
      <ChevronRight className="w-4 h-4 text-[#CCC]" />
    </button>
  );
}

// ─── Delete Confirmation ───
function DeleteConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <motion.div
        className="relative w-full max-w-lg bg-white rounded-t-[20px] p-6 pb-8"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <p className="text-[16px] font-bold text-[#111] mb-2">Excluir este anúncio?</p>
        <p className="text-[13px] text-[#888] mb-6">
          Esta ação não pode ser desfeita. O anúncio será removido permanentemente.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-[#E0E0E0] text-[14px] font-semibold text-[#666] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-[#E53935] text-white text-[14px] font-semibold hover:bg-[#D32F2F] transition-colors"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Stats Panel ───
function StatsPanel({ listingId }: { listingId: string }) {
  const [data, setData] = useState({ views: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [viewsRes, favsRes] = await Promise.all([
        supabase.from("listing_views").select("id", { count: "exact", head: true }).eq("listing_id", listingId).gte("viewed_at", sevenDaysAgo),
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("listing_id", listingId),
      ]);
      setData({
        views: viewsRes.count ?? 0,
        favorites: favsRes.count ?? 0,
      });
      setLoading(false);
    };
    fetch();
  }, [listingId]);

  if (loading) return <div className="p-4"><Skeleton className="h-16 w-full" /></div>;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-[#F8FAFF] border border-[#E8F0FF] rounded-b-xl px-4 py-3.5 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-[20px] font-extrabold text-primary">{data.views}</p>
          <p className="text-[11px] text-[#888]">Visitas (7d)</p>
        </div>
        <div className="text-center">
          <p className="text-[20px] font-extrabold text-primary">{data.favorites}</p>
          <p className="text-[11px] text-[#888]">Favoritos</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Listing Card ML Style ───
function ListingCardML({
  listing,
  onMenuOpen,
  expandedStats,
  onToggleStats,
}: {
  listing: ListingRow;
  onMenuOpen: (l: ListingRow) => void;
  expandedStats: string | null;
  onToggleStats: (id: string) => void;
}) {
  const st = STATUS_BADGE[listing.status] || STATUS_BADGE.draft;
  const quality = getQuality(listing);
  const thumb = listing.screenshots?.[0];
  const navigate = useNavigate();

  const copyId = () => {
    navigator.clipboard.writeText(shortId(listing.id));
    toast.success("ID copiado!");
  };

  const hasPhoto = listing.screenshots && listing.screenshots.length > 0;
  const hasDesc = !!listing.description && listing.description.length > 20;
  const suggestion = !hasPhoto ? "Adicionar foto →" : !hasDesc ? "Completar descrição →" : null;

  return (
    <motion.div layout exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="bg-white border-b border-[#F0F0F0] px-4 py-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="w-[72px] h-[72px] rounded-lg object-cover shrink-0"
              loading="lazy"
            />
          ) : (
            <div
              className="w-[72px] h-[72px] rounded-lg shrink-0 flex items-center justify-center"
              style={{ background: PLATFORM_GRADIENTS[listing.category] || PLATFORM_GRADIENTS.other }}
            >
              <PlatformIcon platformId={listing.category} size={28} className="brightness-0 invert" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title + menu */}
            <div className="flex items-start gap-1">
              <p className="text-[14px] font-semibold text-[#111] line-clamp-2 leading-[1.3] flex-1">
                {listing.title}
              </p>
              <button
                onClick={() => onMenuOpen(listing)}
                className="shrink-0 p-1.5 -mr-1 -mt-0.5 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[hsl(var(--txt-secondary))]" />
              </button>
            </div>

            {/* ID + platform + status */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <button onClick={copyId} className="flex items-center gap-0.5 text-[12px] text-[#999] hover:text-[#666]">
                #{shortId(listing.id)}
                <Copy className="w-3 h-3" />
              </button>
              <span className="text-[12px] text-[#CCC]">·</span>
              <span className="text-[12px] text-[#888]">{getPlatformName(listing.category)}</span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ml-auto ${st.bg} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#F5F5F5] my-2.5" />

            {/* Price */}
            <div className="flex items-center">
              <div className="w-[3px] h-5 rounded-full bg-primary mr-2.5" />
              <p className="text-[16px] font-extrabold text-[#111]">{formatBRL(listing.price)}</p>
            </div>

            {/* Quality */}
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[12px] text-[#666]">Qualidade do anúncio</span>
              <span className="text-[12px] text-[#CCC]">|</span>
              <span className="text-[12px] font-bold" style={{ color: quality.color }}>
                {quality.level}
              </span>
            </div>

            {/* Suggestion */}
            {suggestion && quality.level !== "Profissional" && (
              <button
                onClick={() => navigate(`/vendedor/editar/${listing.id}`)}
                className="text-[12px] font-semibold text-primary mt-1 hover:underline"
              >
                {suggestion}
              </button>
            )}

            {/* Stats toggle */}
            <button
              onClick={() => onToggleStats(listing.id)}
              className="flex items-center gap-1 text-[11px] text-[#999] mt-2 hover:text-[#666]"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {expandedStats === listing.id ? "Ocultar estatísticas" : "Ver estatísticas"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expandedStats === listing.id && <StatsPanel listingId={listing.id} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───
export default function PanelListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("todos");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sheetListing, setSheetListing] = useState<ListingRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingRow | null>(null);
  const [expandedStats, setExpandedStats] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 300);
  };

  const fetchListings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleData;

    let query = supabase
      .from("listings")
      .select("id, title, description, price, category, status, screenshots, created_at, views_count")
      .neq("status", "removed")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("seller_id", user.id);
    }

    const { data, error } = await query;
    if (!error && data) {
      setListings(data as ListingRow[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filtered = useMemo(() => {
    let result = listings;
    const f = FILTERS.find((fi) => fi.id === filter);
    if (f?.dbStatus) {
      result = result.filter((l) => l.status === f.dbStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.title.toLowerCase().includes(q) || getPlatformName(l.category).toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, filter, search]);

  const toggleStatus = async (listing: ListingRow) => {
    const newStatus = listing.status === "active" ? "draft" : "active";
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus as any })
      .eq("id", listing.id);
    if (error) {
      toast.error("Erro ao alterar status");
    } else {
      toast.success(newStatus === "active" ? "Anúncio ativado!" : "Anúncio pausado!");
      setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l)));
    }
    setSheetListing(null);
  };

  const deleteListing = async (listing: ListingRow) => {
    setDeleteTarget(null);
    setSheetListing(null);

    // Optimistic remove
    setListings((prev) => prev.filter((l) => l.id !== listing.id));

    const timer = setTimeout(async () => {
      await supabase.from("listings").update({ status: "removed" as any }).eq("id", listing.id);
    }, 5000);

    toast("Anúncio excluído", {
      action: {
        label: "Desfazer",
        onClick: () => {
          clearTimeout(timer);
          setListings((prev) => [...prev, listing].sort((a, b) => b.created_at.localeCompare(a.created_at)));
        },
      },
      duration: 5000,
    });
  };

  // ─── Render ───
  return (
    <div className="-mx-4 -mt-4">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
        {/* Count + New button */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#888] font-medium">{listings.length} anúncios</span>
          <button
            onClick={() => navigate("/vendedor/novo")}
            className="flex items-center gap-1.5 bg-primary text-white rounded-full px-4 py-2 text-[13px] font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo anúncio
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar anúncio..."
            className="w-full bg-[#F5F5F5] border-none rounded-full py-2.5 pl-11 pr-4 text-[14px] text-[#111] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
                filter === f.id
                  ? "bg-primary text-white"
                  : "bg-[#F5F5F5] text-[#666] border border-[#E8E8E8]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="px-4 py-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-[72px] h-[72px] rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3 mt-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          {listings.length === 0 ? (
            <>
              <Tag className="w-16 h-16 text-[#DDD] mb-4" strokeWidth={1} />
              <p className="text-[16px] font-bold text-[#333]">Você ainda não tem anúncios</p>
              <p className="text-[14px] text-[#888] mt-1">Crie seu primeiro anúncio e comece a vender suas contas</p>
              <button
                onClick={() => navigate("/vendedor/novo")}
                className="mt-6 w-full max-w-xs h-[52px] bg-primary text-white rounded-[14px] text-[16px] font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar primeiro anúncio
              </button>
            </>
          ) : (
            <>
              <SearchX className="w-12 h-12 text-[#DDD] mb-3" strokeWidth={1} />
              <p className="text-[14px] text-[#888]">
                Nenhum anúncio {filter !== "todos" ? FILTERS.find((f) => f.id === filter)?.label.toLowerCase() : ""}{" "}
                encontrado
              </p>
              <button onClick={() => { setFilter("todos"); setSearch(""); setSearchInput(""); }} className="text-primary text-[13px] font-semibold mt-2 hover:underline">
                Ver todos os anúncios
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          <AnimatePresence mode="popLayout">
            {filtered.map((listing) => (
              <ListingCardML
                key={listing.id}
                listing={listing}
                onMenuOpen={setSheetListing}
                expandedStats={expandedStats}
                onToggleStats={(id) => setExpandedStats((prev) => (prev === id ? null : id))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Sheet */}
      <AnimatePresence>
        {sheetListing && !deleteTarget && (
          <ActionSheet
            listing={sheetListing}
            onClose={() => setSheetListing(null)}
            onEdit={() => {
              navigate(`/vendedor/editar/${sheetListing.id}`);
              setSheetListing(null);
            }}
            onToggle={() => toggleStatus(sheetListing)}
            onDelete={() => setDeleteTarget(sheetListing)}
            onView={() => {
              window.open(`/listing/${sheetListing.id}`, "_blank");
              setSheetListing(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => deleteListing(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
