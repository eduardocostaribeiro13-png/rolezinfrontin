import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { TOURS } from "@/lib/tours";

export default defineTool({
  name: "list_tours",
  title: "Listar passeios",
  description:
    "Lista todos os passeios de quadriciclo oferecidos pela Rolezin Frontin Off Road, com nome, duração, nível, preço e destaques.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const tours = TOURS.map((t) => ({
      slug: t.slug,
      name: t.name,
      short: t.short,
      duration: t.duration,
      level: t.level,
      max_people: t.maxPeople,
      price_brl: t.price,
      highlights: t.highlights,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(tours, null, 2) }],
      structuredContent: { tours },
    };
  },
});
