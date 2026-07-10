import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const input = z.object({
  tour_slug: z.string().min(1),
  tour_name: z.string().min(1),
  reservation_date: z.string().min(1), // YYYY-MM-DD
  reservation_time: z.string().min(1),
  adults: z.number().int().min(1).max(50),
  kids: z.number().int().min(0).max(50),
  total_price: z.number().int().positive(), // in BRL (reais)
  customer_name: z.string().trim().min(3).max(120),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().trim().min(8).max(30),
  customer_whatsapp: z.string().trim().min(8).max(30).optional(),
  customer_city: z.string().trim().max(120).optional(),
  customer_state: z.string().trim().max(4).optional(),
  notes: z.string().trim().max(1000).optional(),
});

function getAppUrl(): string {
  const req = getRequest();
  const proto =
    req?.headers.get("x-forwarded-proto") ??
    (req?.url.startsWith("https") ? "https" : "http");
  const host =
    req?.headers.get("x-forwarded-host") ??
    req?.headers.get("host") ??
    "localhost";
  return `${proto}://${host}`;
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof input>) => input.parse(data))
  .handler(async ({ data }) => {
    const handle = process.env.INFINITEPAY_HANDLE;
    if (!handle) throw new Error("INFINITEPAY_HANDLE não configurado");

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const orderNsu = crypto.randomUUID();
    const priceCents = Math.round(data.total_price * 100);
    const quantity = data.adults + data.kids;
    const appUrl = process.env.APP_URL ?? getAppUrl();

    const { error: insertError } = await supabaseAdmin
      .from("reservations")
      .insert({
        order_nsu: orderNsu,
        tour_slug: data.tour_slug,
        tour_name: data.tour_name,
        vehicle: "Quadriciclo",
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        adults: data.adults,
        kids: data.kids,
        quantity,
        total_price: priceCents,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_whatsapp: data.customer_whatsapp ?? null,
        customer_city: data.customer_city ?? null,
        customer_state: data.customer_state ?? null,
        notes: data.notes ?? null,
        payment_status: "PENDING_PAYMENT",
      });

    if (insertError) {
      console.error("[checkout] insert error", insertError);
      throw new Error("Falha ao criar reserva");
    }

    const payload = {
      handle,
      redirect_url: `${appUrl}/pagamento/sucesso?order=${orderNsu}`,
      webhook_url: `${appUrl}/api/infinitepay/webhook`,
      order_nsu: orderNsu,
      customer: {
        name: data.customer_name,
        email: data.customer_email,
        phone_number: data.customer_phone,
      },
      items: [
        {
          quantity: 1,
          price: priceCents,
          description: `${data.tour_name} — ${data.adults} adulto(s)${data.kids ? ` + ${data.kids} criança(s)` : ""}`,
        },
      ],
    };

    console.log("[checkout] Valor total: R$", (priceCents / 100).toFixed(2));
    console.log("[checkout] Pessoas:", quantity, `(${data.adults} adultos + ${data.kids} crianças)`);
    console.log("[checkout] Payload:", JSON.stringify(payload));

    const res = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[checkout] infinitepay error", res.status, text);
      await supabaseAdmin
        .from("reservations")
        .update({ payment_status: "FAILED" })
        .eq("order_nsu", orderNsu);
      throw new Error("Não foi possível gerar o link de pagamento");
    }

    const json = (await res.json()) as { url?: string };
    if (!json.url) {
      throw new Error("Resposta inválida da InfinitePay");
    }

    return { url: json.url, order_nsu: orderNsu };
  });

const lookupInput = z.object({ order_nsu: z.string().uuid() });

export const getReservationByOrder = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof lookupInput>) => lookupInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .select(
        "id,customer_name,tour_name,vehicle,reservation_date,reservation_time,adults,kids,quantity,total_price,paid_amount,payment_status,payment_method,receipt_url,customer_phone",
      )
      .eq("order_nsu", data.order_nsu)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { reservation: row };
  });
