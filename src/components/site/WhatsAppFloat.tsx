import { MessageCircle } from "lucide-react";
import { waQuickBooking } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  return (
    <a
      href={waQuickBooking()}
      target="_blank"
      rel="noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid place-items-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] hover:scale-110 transition-transform"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  );
}
