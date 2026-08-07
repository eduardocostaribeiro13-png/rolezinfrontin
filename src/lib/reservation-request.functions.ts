import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * requestReservation — registra uma SOLICITAÇÃO de reserva (sem pagamento online).
 *
 * O fluxo público não usa mais gateway de pagamento: a reserva entra como
 * PENDING_PAYMENT (= aguardando confirmação manual da equipe) e a finalização
 * acontece pelo WhatsApp.
 *
 * Preço, duração e nome vêm SEMPRE do banco (snapshot gravado na reserva),
 * nunca do cliente.
 */

const input = z.object({
  experience_slug: z.string().trim().min(1).max(200),
  vehicle_id: z.string().uuid(),
  reservation_date: z.string().min(1).max(20),
  reservation_time: z.string().min(1).max(10),
  customer_name: z.string().trim().min(3).max(120),
  customer_email: z.string().trim().email().max(200),
  customer_phone: z.string().trim().min(8).max(30),
  customer_whatsapp: z.string().trim().min(8).max(30).optional(),
  customer_city: z.string().trim().max(120).optional(),
  customer_state: z.string().trim().max(4).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const PG_UNIQUE_VIOLATION = "23505";

class SlotTakenError extends Error {
  constructor() {
    super(
      "Este horário acabou de ser reservado por outro cliente. Escolha outro horário.",
    );
    this.name = "SlotTakenError";
  }
}

export const requestReservation = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof input>) => input.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Libera slots pendentes já expirados (reservas antigas do fluxo de pagamento).
    await supabaseAdmin.rpc("expire_pending_reservations" as never, {} as never);

    // Conferência de disponibilidade (o índice único é a fonte final de verdade).
    const { data: takenRows, error: takenError } = await supabaseAdmin
      .from("reservations")
      .select("id")
      .eq("vehicle_id", data.vehicle_id)
      .eq("reservation_date", data.reservation_date)
      .eq("reservation_time", data.reservation_time)
      .in("payment_status", ["PENDING_PAYMENT", "PAID"])
      .limit(1);

    if (takenError) {
      console.error("[reserva] erro ao verificar disponibilidade", takenError);
      throw new Error("Falha ao verificar disponibilidade");
    }
    if (takenRows && takenRows.length > 0) throw new SlotTakenError();

    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from("vehicles" as never)
      .select("name,status,capacity")
      .eq("id", data.vehicle_id)
      .maybeSingle<{ name: string; status: string; capacity: number }>();

    if (vehicleError || !vehicle || vehicle.status !== "ACTIVE") {
      throw new Error("Veículo indisponível");
    }

    const { data: exp, error: expError } = await supabaseAdmin
      .from("experiences" as never)
      .select("id,name,price_cents,duration_hours,max_people,status")
      .eq("slug", data.experience_slug)
      .maybeSingle<{
        id: string;
        name: string;
        price_cents: number;
        duration_hours: number | string;
        max_people: number;
        status: string;
      }>();

    if (expError || !exp || exp.status !== "PUBLISHED") {
      throw new Error("Experiência indisponível");
    }

    const hours = Math.max(1, Math.round(Number(exp.duration_hours) || 1));
    const totalCents = Math.max(0, Number(exp.price_cents) || 0);
    const quantity = Math.max(1, vehicle.capacity ?? 1);
    const orderNsu = crypto.randomUUID();

    const { error: insertError } = await supabaseAdmin
      .from("reservations")
      .insert({
        order_nsu: orderNsu,
        experience_id: exp.id,
        vehicle_id: data.vehicle_id,
        // Snapshot legado/compatível: guarda slug e nome no momento da solicitação.
        tour_slug: data.experience_slug,
        tour_name: exp.name,
        vehicle: vehicle.name,
        reservation_date: data.reservation_date,
        reservation_time: data.reservation_time,
        adults: quantity,
        kids: 0,
        quantity,
        duration_hours: hours,
        total_price: totalCents,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_whatsapp: data.customer_whatsapp ?? null,
        customer_city: data.customer_city ?? null,
        customer_state: data.customer_state ?? null,
        notes: data.notes ?? null,
        // Aguardando confirmação manual — nunca PAID.
        payment_status: "PENDING_PAYMENT",
        expires_at: null,
      } as never);

    if (insertError) {
      if ((insertError as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw new SlotTakenError();
      }
      console.error("[reserva] erro ao inserir", insertError);
      throw new Error("Falha ao registrar a solicitação");
    }

    return {
      order_nsu: orderNsu,
      experience_name: exp.name,
      vehicle_name: vehicle.name,
      duration_hours: hours,
      quantity,
      total_cents: totalCents,
    };
  });
