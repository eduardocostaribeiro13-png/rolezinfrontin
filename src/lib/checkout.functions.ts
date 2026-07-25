import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const input = z.object({
  vehicle_id: z.string().uuid(),
  tour_slug: z.string().min(1),
  reservation_date: z.string().min(1),
  reservation_time: z.string().min(1),
  adults: z.number().int().min(1).max(50),
  kids: z.number().int().min(0).max(50),
  customer_name: z.string().trim().min(3).max(120),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().trim().min(8).max(30),
  customer_whatsapp: z.string().trim().min(8).max(30).optional(),
  customer_city: z.string().trim().max(120).optional(),
  customer_state: z.string().trim().max(4).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/** Pending reservations expire after this window (minutes). */
const PENDING_TTL_MINUTES = 20;

/** Postgres unique-violation error code. */
const PG_UNIQUE_VIOLATION = "23505";

class SlotTakenError extends Error {
  constructor() {
    super(
      "Este horário acabou de ser reservado por outro cliente. Escolha outro horário.",
    );
    this.name = "SlotTakenError";
  }
}

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

    // 1) Sweep expired pending reservations so the unique index reflects
    //    actual availability before we attempt the insert.
    await supabaseAdmin.rpc(
      "expire_pending_reservations" as never,
      {} as never,
    );

    // 2) Server-side availability check (defense in depth — the unique index
    //    is still the source of truth against concurrent writers).
    const { data: takenRows, error: takenError } = await supabaseAdmin
      .from("reservations")
      .select("id")
      .eq("vehicle_id", data.vehicle_id)
      .eq("reservation_date", data.reservation_date)
      .eq("reservation_time", data.reservation_time)
      .in("payment_status", ["PENDING_PAYMENT", "PAID"])
      .limit(1);

    if (takenError) {
      console.error("[checkout] availability query error", takenError);
      throw new Error("Falha ao verificar disponibilidade");
    }
    if (takenRows && takenRows.length > 0) {
      throw new SlotTakenError();
    }

    // 3) Vehicle lookup (name for the reservation record).
    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from("vehicles" as never)
      .select("name,status")
      .eq("id", data.vehicle_id)
      .maybeSingle<{ name: string; status: string }>();

    if (vehicleError || !vehicle || vehicle.status !== "ACTIVE") {
      throw new Error("Veículo indisponível");
    }

    // 3b) Authoritative price + duration lookup from the tours table.
    // NEVER trust client-supplied price or duration values.
    const { data: tour, error: tourError } = await supabaseAdmin
      .from("tours" as never)
      .select("name,price_per_hour_cents,duration_hours,status")
      .eq("slug", data.tour_slug)
      .maybeSingle<{
        name: string;
        price_per_hour_cents: number;
        duration_hours: number;
        status: string;
      }>();

    if (
      tourError ||
      !tour ||
      tour.status !== "ACTIVE" ||
      !tour.price_per_hour_cents ||
      tour.price_per_hour_cents <= 0 ||
      !tour.duration_hours ||
      tour.duration_hours <= 0
    ) {
      throw new Error("Passeio indisponível");
    }

    const orderNsu = crypto.randomUUID();
    const pricePerHourCents = tour.price_per_hour_cents;
    const hours = Math.max(1, Math.round(Number(tour.duration_hours)));
    // Single source of truth: total = server price_per_hour × server hours.
    const priceCents = pricePerHourCents * hours;
    const quantity = data.adults + data.kids;
    const appUrl = process.env.APP_URL ?? getAppUrl();
    const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("INFINITEPAY_WEBHOOK_SECRET não configurado");
    }
    const expiresAt = new Date(
      Date.now() + PENDING_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    // 4) Insert reservation. Unique partial index guarantees no double booking.
    const { error: insertError } = await supabaseAdmin
      .from("reservations")
      .insert({
        order_nsu: orderNsu,
        vehicle_id: data.vehicle_id,
        tour_slug: data.tour_slug,
        tour_name: tour.name,
        vehicle: vehicle.name,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        adults: data.adults,
        kids: data.kids,
        quantity,
        duration_hours: hours,
        price_per_hour_cents: pricePerHourCents,
        total_price: priceCents,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_whatsapp: data.customer_whatsapp ?? null,
        customer_city: data.customer_city ?? null,
        customer_state: data.customer_state ?? null,
        notes: data.notes ?? null,
        payment_status: "PENDING_PAYMENT",
        expires_at: expiresAt,
      } as never);

    if (insertError) {
      if ((insertError as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw new SlotTakenError();
      }
      console.error("[checkout] insert error", insertError);
      throw new Error("Falha ao criar reserva");
    }

    const payload = {
      handle,
      redirect_url: `${appUrl}/pagamento/sucesso?order=${orderNsu}`,
      webhook_url: `${appUrl}/api/infinitepay/webhook?secret=${encodeURIComponent(webhookSecret)}`,
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
          description: `${tour.name} — ${hours}h`,
        },
      ],
    };

    console.log(
      "[checkout] Valor total: R$",
      (priceCents / 100).toFixed(2),
      "| Pessoas:",
      quantity,
      "| Veículo:",
      vehicle.name,
    );
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
