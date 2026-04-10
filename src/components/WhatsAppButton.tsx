import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5547996300314";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20na%20Froiv!`;

export function WhatsAppLink({ children, message, className }: { children?: React.ReactNode; message?: string; className?: string }) {
  const url = message
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : WHATSAPP_URL;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export default function WhatsAppFloatingButton() {
  return (
    <WhatsAppLink className="fixed bottom-20 sm:bottom-6 right-4 z-50 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1fb855] shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95">
      <MessageCircle className="h-7 w-7 text-white fill-white" />
    </WhatsAppLink>
  );
}
