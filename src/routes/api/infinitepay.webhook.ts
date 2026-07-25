import { createFileRoute } from "@tanstack/react-router";

type WebhookBody = {
  invoice_slug?: string;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
  transaction_nsu?: string;
  order_nsu?: string;
  receipt_url?: string;
};

export const Route = createFileRoute("/api/infinitepay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Verify shared webhook secret before trusting the payload.
        // The secret is embedded in the webhook_url query string when the
        // checkout link is created, so only InfinitePay callbacks reaching
        // that exact URL are honored.
        const expectedSecret = process.env.INFINITEPAY_WEBHOOK_SECRET;
        if (!expectedSecret) {
          console.error("[webhook] INFINITEPAY_WEBHOOK_SECRET not configured");
          return Response.json(
            { success: false, message: "Webhook not configured" },
            { status: 500 },
          );
        }
        const url = new URL(request.url);
        const providedSecret =
          url.searchParams.get("secret") ??
          request.headers.get("x-webhook-secret") ??
          "";
        const a = new TextEncoder().encode(providedSecret);
        const b = new TextEncoder().encode(expectedSecret);
        let ok = a.length === b.length;
        for (let i = 0; i < a.length && i < b.length; i++) {
          if (a[i] !== b[i]) ok = false;
        }
        if (!ok) {
          return Response.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
          );
        }

        let body: WebhookBody;
        try {
          body = (await request.json()) as WebhookBody;
        } catch {
          return Response.json(
            { success: false, message: "Invalid JSON" },
            { status: 400 },
          );
        }

        if (!body.order_nsu) {
          return Response.json(
            { success: false, message: "order_nsu required" },
            { status: 400 },
          );
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { data: existing, error: findError } = await supabaseAdmin
          .from("reservations")
          .select("id")
          .eq("order_nsu", body.order_nsu)
          .maybeSingle();

        if (findError) {
          console.error("[webhook] find error", findError);
          return Response.json(
            { success: false, message: "Lookup failed" },
            { status: 500 },
          );
        }

        if (!existing) {
          return Response.json(
            { success: false, message: "Reservation not found" },
            { status: 400 },
          );
        }

        const { error: updateError } = await supabaseAdmin
          .from("reservations")
          .update({
            payment_status: "PAID",
            payment_method: body.capture_method ?? null,
            transaction_nsu: body.transaction_nsu ?? null,
            invoice_slug: body.invoice_slug ?? null,
            receipt_url: body.receipt_url ?? null,
            paid_amount: body.paid_amount ?? null,
            installments: body.installments ?? null,
            paid_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("[webhook] update error", updateError);
          return Response.json(
            { success: false, message: "Update failed" },
            { status: 500 },
          );
        }

        return Response.json({ success: true });
      },
    },
  },
});
