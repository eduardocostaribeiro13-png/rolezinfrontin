import { defineMcp } from "@lovable.dev/mcp-js";
import listTours from "./tools/list-tours";
import getTour from "./tools/get-tour";
import getContact from "./tools/get-contact";
import createBookingLink from "./tools/booking-link";

export default defineMcp({
  name: "rolezin-frontin-off-road",
  title: "Rolezin Frontin Off Road",
  version: "0.1.0",
  instructions:
    "Ferramentas públicas da Rolezin Frontin Off Road, operadora de passeios de quadriciclo em Engenheiro Paulo de Frontin (RJ). Use `list_tours` para ver todos os passeios, `get_tour` para detalhes de um passeio pelo slug, `get_contact` para canais de atendimento e `create_booking_link` para gerar um link do WhatsApp já com a mensagem de reserva.",
  tools: [listTours, getTour, getContact, createBookingLink],
});
