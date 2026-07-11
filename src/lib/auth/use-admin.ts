import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminAuthState = {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
};

/**
 * useAdminAuth — client-side hook to read the current Supabase session and
 * whether the signed-in user has the admin role. Attempts a one-time claim
 * via `claim_admin_if_whitelisted` on first login for whitelisted emails.
 */
export function useAdminAuth(): AdminAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Try claim (idempotent, only succeeds for whitelisted emails).
      await (supabase.rpc as unknown as (
        fn: string,
      ) => Promise<{ data: unknown; error: unknown }>)(
        "claim_admin_if_whitelisted",
      );
      const { data, error } = await supabase
        .from("user_roles" as never)
        .select("role")
        .eq("user_id", nextSession.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setIsAdmin(!!data && !error);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => check(s));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, session, isAdmin };
}
