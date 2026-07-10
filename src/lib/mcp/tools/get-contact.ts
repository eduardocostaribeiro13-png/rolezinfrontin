import { defineTool } from "@lovable.dev/mcp-js";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

export default defineTool({
  name: "get_contact",
  title: "Contato e redes",
  description:
    "Retorna os canais oficiais de contato da Rolezin Frontin Off Road: WhatsApp e Instagram.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const payload = {
      whatsapp_number: WHATSAPP_NUMBER,
      whatsapp_display: WHATSAPP_DISPLAY,
      instagram_handle: INSTAGRAM_HANDLE,
      instagram_url: INSTAGRAM_URL,
      location: "Engenheiro Paulo de Frontin - RJ, Brasil",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
