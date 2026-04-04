import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import PageHeader from "@/components/menu/PageHeader";
import { toast } from "sonner";

const MOCK_PENDING = [
  {
    id: 1,
    title: "Instagram 50K - Fitness",
    thumb: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=96&h=96&fit=crop",
    date: "Comprado em 15/03/2026",
  },
];

const MOCK_DONE = [
  {
    id: 2,
    title: "Free Fire Nível 80",
    thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=96&h=96&fit=crop",
    rating: 5,
    comment: "Conta perfeita, tudo conforme anunciado!",
    date: "10/03/2026",
  },
];

export default function Reviews() {
  const [tab, setTab] = useState<"pending" | "done">("pending");
  const [selectedRating, setSelectedRating] = useState<Record<number, number>>({});
  const [comment, setComment] = useState("");

  const handlePublish = (id: number) => {
    toast.success("Avaliação publicada! +10 pontos 🎉");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <PageHeader title="Minhas Avaliações" />

      <div className="px-4 pt-3">
        <div className="flex gap-0 bg-white rounded-xl border border-[#E8E8E8] overflow-hidden mb-4">
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 ${
              tab === "pending" ? "bg-primary text-white" : "text-[#666]"
            }`}
          >
            Para avaliar
            {MOCK_PENDING.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === "pending" ? "bg-white/20" : "bg-destructive text-white"}`}>
                {MOCK_PENDING.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("done")}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
              tab === "done" ? "bg-primary text-white" : "text-[#666]"
            }`}
          >
            Avaliadas
          </button>
        </div>

        {tab === "pending" && (
          <div className="space-y-3">
            {MOCK_PENDING.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
                <div className="flex gap-3 items-start">
                  <img src={item.thumb} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#111]">{item.title}</p>
                    <p className="text-[11px] text-[#999]">{item.date}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setSelectedRating({ ...selectedRating, [item.id]: s })}>
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          (selectedRating[item.id] || 0) >= s ? "text-[#FFB800] fill-[#FFB800]" : "text-[#DDD]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating[item.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 space-y-2">
                    <textarea
                      placeholder="Conte sua experiência..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#E0E0E0] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => handlePublish(item.id)}
                      className="w-full py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold"
                    >
                      Publicar avaliação
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "done" && (
          <div className="space-y-3">
            {MOCK_DONE.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4">
                <div className="flex gap-3 items-start">
                  <img src={item.thumb} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#111]">{item.title}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${s <= item.rating ? "text-[#FFB800] fill-[#FFB800]" : "text-[#DDD]"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[13px] text-[#555] mt-1">{item.comment}</p>
                    <p className="text-[11px] text-[#999] mt-1">{item.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
