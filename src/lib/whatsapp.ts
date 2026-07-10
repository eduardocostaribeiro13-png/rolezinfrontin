export const WHATSAPP_NUMBER = "5521982974596";
export const WHATSAPP_DISPLAY = "+55 21 98297-4596";
export const INSTAGRAM_URL = "https://instagram.com/frontinoffroad";
export const INSTAGRAM_HANDLE = "@frontinoffroad";

export function waLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const waQuickBooking = (tourName?: string) =>
  waLink(
    tourName
      ? `Olá! Quero reservar o passeio ${tourName} com a Rolezin Frontin Off Road.`
      : "Olá! Quero reservar um passeio com a Rolezin Frontin Off Road.",
  );
