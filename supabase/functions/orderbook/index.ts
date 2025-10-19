import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting map: IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientLimit = rateLimitMap.get(clientIp);

  if (!clientLimit || now > clientLimit.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (clientLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientLimit.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const trading_pair_id = url.searchParams.get('trading_pair_id');

    if (!trading_pair_id) {
      throw new Error('trading_pair_id is required');
    }

    // Get buy orders (bids) - highest price first
    const { data: bids } = await supabaseClient
      .from('orders')
      .select('id, price, quantity, remaining_quantity, created_at')
      .eq('trading_pair_id', trading_pair_id)
      .eq('side', 'buy')
      .eq('status', 'open')
      .gt('remaining_quantity', 0)
      .order('price', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(50);

    // Get sell orders (asks) - lowest price first
    const { data: asks } = await supabaseClient
      .from('orders')
      .select('id, price, quantity, remaining_quantity, created_at')
      .eq('trading_pair_id', trading_pair_id)
      .eq('side', 'sell')
      .eq('status', 'open')
      .gt('remaining_quantity', 0)
      .order('price', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(50);

    // Aggregate orders at same price level
    const aggregateBids = aggregateOrders(bids || []);
    const aggregateAsks = aggregateOrders(asks || []);

    // Calculate spread and mid price
    const bestBid = aggregateBids[0]?.price || 0;
    const bestAsk = aggregateAsks[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;

    // Get recent trades
    const { data: recentTrades } = await supabaseClient
      .from('trades')
      .select('price, quantity, created_at')
      .eq('trading_pair_id', trading_pair_id)
      .order('created_at', { ascending: false })
      .limit(50);

    return new Response(
      JSON.stringify({
        bids: aggregateBids,
        asks: aggregateAsks,
        spread,
        midPrice,
        bestBid,
        bestAsk,
        recentTrades: recentTrades || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function aggregateOrders(orders: any[]) {
  const priceMap = new Map<number, { price: number; quantity: number; orders: number }>();

  for (const order of orders) {
    const price = Number(order.price);
    const existing = priceMap.get(price);
    
    if (existing) {
      existing.quantity += Number(order.remaining_quantity);
      existing.orders += 1;
    } else {
      priceMap.set(price, {
        price,
        quantity: Number(order.remaining_quantity),
        orders: 1
      });
    }
  }

  return Array.from(priceMap.values());
}
