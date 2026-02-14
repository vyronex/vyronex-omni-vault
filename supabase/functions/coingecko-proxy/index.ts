import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "coins/markets";
    const params = url.searchParams.get("params") || "vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false";

    const apiKey = Deno.env.get("COINGECKO_API_KEY");
    if (!apiKey) {
      throw new Error("COINGECKO_API_KEY not configured");
    }

    // Whitelist allowed endpoints to prevent abuse
    const allowedEndpoints = [
      "coins/markets",
      "coins/list",
      "simple/price",
      "global",
      "search/trending",
      "derivatives",
      "derivatives/exchanges",
      "exchanges",
    ];
    
    // Also allow coins/{id} and coins/{id}/market_chart patterns
    const isAllowed = allowedEndpoints.includes(endpoint) || 
      /^coins\/[a-z0-9-]+$/.test(endpoint) ||
      /^coins\/[a-z0-9-]+\/market_chart$/.test(endpoint) ||
      /^coins\/[a-z0-9-]+\/tickers$/.test(endpoint);

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Endpoint not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const separator = params ? "?" : "";
    const apiUrl = `https://api.coingecko.com/api/v3/${endpoint}${separator}${params}`;

    const response = await fetch(apiUrl, {
      headers: {
        "x-cg-demo-api-key": apiKey,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CoinGecko proxy error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
