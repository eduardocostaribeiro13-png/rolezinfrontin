import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const claimAdminIfWhitelistedFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: userRow, error: userErr } = await supabaseAdmin
      .from("users" as never)
      .select("email")
      .eq("id", userId)
      .maybeSingle()
      .overrideTypes<{ email: string | null }>();
    // Fallback: query auth schema directly via admin API
    let email: string | null = (userRow as { email: string | null } | null)?.email ?? null;
    if (userErr || !email) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      email = authUser?.user?.email ?? null;
    }
    if (!email) return false;

    const { data: wl } = await supabaseAdmin
      .from("admin_whitelist")
      .select("email")
      .ilike("email", email)
      .maybeSingle();
    if (!wl) return false;

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (insErr && !String(insErr.message).toLowerCase().includes("duplicate")) {
      // ignore conflicts, surface other errors
      throw new Error("Failed to claim admin role");
    }
    return true;
  });
