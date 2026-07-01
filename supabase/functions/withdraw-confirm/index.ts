import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  request_id: z.string().uuid(),
  code: z.string().length(6).regex(/^\d{6}$/),
});

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { request_id, code } = parsed.data;

    const { data: conf } = await supabase
      .from("withdrawal_confirmations")
      .select("*")
      .eq("request_id", request_id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conf) return json({ error: "Confirmation not found" }, 404);
    if (conf.verified_at) return json({ error: "Already confirmed" }, 400);
    if (new Date(conf.expires_at).getTime() < Date.now()) {
      return json({ error: "Code expired" }, 400);
    }
    if (conf.attempts >= 5) return json({ error: "Too many attempts" }, 429);

    const hash = await sha256(`${request_id}:${code}`);
    if (hash !== conf.code_hash) {
      await supabase.from("withdrawal_confirmations")
        .update({ attempts: conf.attempts + 1 }).eq("id", conf.id);
      return json({ error: "Invalid code" }, 400);
    }

    await supabase.from("withdrawal_confirmations")
      .update({ verified_at: new Date().toISOString() }).eq("id", conf.id);

    await supabase.from("withdrawal_requests")
      .update({ status: "pending_review" }).eq("id", request_id);

    return json({ ok: true, status: "pending_review" });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
