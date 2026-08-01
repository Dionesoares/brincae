export const WHATSAPP_NUMBER = "5563999836349";
export const PHONE_DISPLAY = "(63) 99983-6349";

export function getWhatsAppLink(message = "") {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}