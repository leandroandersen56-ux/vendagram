import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatBRL } from "@/lib/mock-data";

export interface CartItem {
  listingId: string;
  title: string;
  price: number;
  category: string;
  screenshot?: string;
}

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem("froiv_cart") || "[]");
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem) {
  const cart = getCart().filter((c) => c.listingId !== item.listingId);
  cart.push(item);
  localStorage.setItem("froiv_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-update"));
}

export function removeFromCart(listingId: string) {
  const cart = getCart().filter((c) => c.listingId !== listingId);
  localStorage.setItem("froiv_cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-update"));
}

export function clearCart() {
  localStorage.setItem("froiv_cart", JSON.stringify([]));
  window.dispatchEvent(new Event("cart-update"));
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const refresh = () => setItems(getCart());

  useEffect(() => {
    refresh();
    window.addEventListener("cart-update", refresh);
    return () => window.removeEventListener("cart-update", refresh);
  }, []);

  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[72px] pb-24 md:pb-12">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-txt-secondary hover:text-txt-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-txt-primary">Meu Carrinho</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="h-12 w-12 text-border mx-auto mb-4" />
              <p className="text-txt-secondary text-[15px] mb-1">Seu carrinho está vazio</p>
              <p className="text-txt-hint text-[13px] mb-6">Explore o marketplace e adicione contas ao carrinho.</p>
              <Link to="/">
                <Button size="sm" className="rounded-lg">Explorar</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.listingId}
                    className="flex items-center gap-4 bg-card border border-border rounded-xl p-4"
                  >
                    {item.screenshot ? (
                      <img
                        src={item.screenshot}
                        alt={item.title}
                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <PlatformIcon platformId={item.category} size={32} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/listing/${item.listingId}`}
                        className="text-[14px] font-medium text-txt-primary hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[12px] text-txt-hint capitalize mt-0.5">
                        {item.category.replace("_", " ")}
                      </p>
                    </div>
                    <span className="text-[15px] font-semibold text-txt-primary whitespace-nowrap">
                      {formatBRL(item.price)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.listingId)}
                      className="h-8 w-8 flex items-center justify-center text-txt-hint hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] text-txt-secondary">Total ({items.length} {items.length === 1 ? "item" : "itens"})</span>
                  <span className="text-lg font-semibold text-txt-primary">{formatBRL(total)}</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-[13px]"
                    onClick={() => { clearCart(); refresh(); }}
                  >
                    Limpar carrinho
                  </Button>
                  {items.length === 1 ? (
                    <Link to={`/checkout/${items[0].listingId}`} className="flex-1">
                      <Button size="sm" className="w-full rounded-lg text-[13px]">
                        Finalizar compra
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" className="flex-1 rounded-lg text-[13px]" disabled>
                      Finalizar compra (1 item por vez)
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
