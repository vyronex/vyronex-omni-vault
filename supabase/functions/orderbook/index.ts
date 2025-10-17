import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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
      .select('id, user_id, price, quantity, remaining_quantity, created_at')
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
      .select('id, user_id, price, quantity, remaining_quantity, created_at')
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
