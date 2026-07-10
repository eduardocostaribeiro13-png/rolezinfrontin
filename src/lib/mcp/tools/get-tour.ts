import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { TOURS } from "@/lib/tours";

export default defineTool({
  name: "get_tour",
  title: "Detalhes do passeio",
  description:
    "Retorna os detalhes completos de um passeio da Rolezin Frontin Off Road pelo slug (ex: 'trilha-do-mirante').",
  inputSchema: {
    slug: z.string().min(1).describe("Slug do passeio, ex: 'expedicao-cachoeiras'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const tour = TOURS.find((t) => t.slug === slug);
    if (!tour) {
      return {
        content: [{ type: "text", text: `Passeio '${slug}' não encontrado.` }],
        isError: true,
      };
    }
    const payload = {
      slug: tour.slug,
      name: tour.name,
      short: tour.short,
      description: tour.description,
      duration: tour.duration,
      level: tour.level,
      max_people: tour.maxPeople,
      price_brl: tour.price,
      highlights: tour.highlights,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
