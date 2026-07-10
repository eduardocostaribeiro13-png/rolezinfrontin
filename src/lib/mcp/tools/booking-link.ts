import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { TOURS } from "@/lib/tours";
import { waLink } from "@/lib/whatsapp";

export default defineTool({
  name: "create_booking_link",
  title: "Gerar link de reserva",
  description:
    "Gera um link do WhatsApp com uma mensagem pré-preenchida para reservar um passeio. Passe o slug do passeio e, opcionalmente, data, horário e número de pessoas.",
  inputSchema: {
    slug: z.string().min(1).describe("Slug do passeio."),
    date: z.string().optional().describe("Data desejada (ex: 2026-08-15)."),
    time: z.string().optional().describe("Horário desejado (ex: 09:00)."),
    people: z.number().int().positive().optional().describe("Número de pessoas."),
    name: z.string().optional().describe("Nome do cliente."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: ({ slug, date, time, people, name }) => {
    const tour = TOURS.find((t) => t.slug === slug);
    if (!tour) {
      return {
        content: [{ type: "text", text: `Passeio '${slug}' não encontrado.` }],
        isError: true,
      };
    }
    const parts = [
      `Olá! ${name ? `Aqui é ${name}. ` : ""}Quero reservar o passeio ${tour.name} com a Rolezin Frontin Off Road.`,
    ];
    if (date) parts.push(`Data: ${date}.`);
    if (time) parts.push(`Horário: ${time}.`);
    if (people) parts.push(`Pessoas: ${people}.`);
    const message = parts.join(" ");
    const url = waLink(message);
    const payload = { url, message, tour: tour.name, price_brl: tour.price };
    return {
      content: [{ type: "text", text: `Link de reserva: ${url}` }],
      structuredContent: payload,
    };
  },
});
