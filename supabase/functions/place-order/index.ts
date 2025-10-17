import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Order {
  id: string;
  user_id: string;
  trading_pair_id: string;
  side: 'buy' | 'sell';
  order_type: 'limit' | 'market';
  price: number;
  quantity: number;
  remaining_quantity: number;
  created_at: string;
}

interface Trade {
  trading_pair_id: string;
  buyer_id: string;
  seller_id: string;
  price: number;
  quantity: number;
  order_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { trading_pair_id, side, order_type, price, quantity } = await req.json();

    if (!trading_pair_id || !side || !order_type || !quantity) {
      throw new Error('Missing required fields');
    }

    // Validate trading pair exists
    const { data: tradingPair } = await supabaseClient
      .from('trading_pairs')
      .select('*')
      .eq('id', trading_pair_id)
      .eq('is_active', true)
      .single();

    if (!tradingPair) {
      throw new Error('Invalid or inactive trading pair');
    }

    // Create the order
    const { data: newOrder, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        trading_pair_id,
        side,
        order_type,
        price: order_type === 'limit' ? price : null,
        quantity,
        remaining_quantity: quantity,
        status: 'open'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Match orders
    const trades = await matchOrder(supabaseClient, newOrder as Order, tradingPair);

    // Update order status
    if (newOrder.remaining_quantity === 0) {
      await supabaseClient
        .from('orders')
        .update({ status: 'filled' })
        .eq('id', newOrder.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: newOrder,
        trades: trades.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function matchOrder(supabase: any, incomingOrder: Order, tradingPair: any): Promise<Trade[]> {
  const trades: Trade[] = [];
  let remaining = incomingOrder.remaining_quantity;

  // Get opposite side orders, sorted by price
  const oppositeSide = incomingOrder.side === 'buy' ? 'sell' : 'buy';
  const { data: oppositeOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('trading_pair_id', incomingOrder.trading_pair_id)
    .eq('side', oppositeSide)
    .eq('status', 'open')
    .gt('remaining_quantity', 0)
    .order('price', { ascending: incomingOrder.side === 'buy' })
    .order('created_at', { ascending: true });

  if (!oppositeOrders || oppositeOrders.length === 0) {
    return trades;
  }

  for (const matchOrder of oppositeOrders) {
    if (remaining <= 0) break;

    // Check if prices match
    const priceMatch = incomingOrder.order_type === 'market' || 
                       matchOrder.order_type === 'market' ||
                       (incomingOrder.side === 'buy' && incomingOrder.price >= matchOrder.price) ||
                       (incomingOrder.side === 'sell' && incomingOrder.price <= matchOrder.price);

    if (!priceMatch) continue;

    // Calculate trade amount
    const tradeQuantity = Math.min(remaining, matchOrder.remaining_quantity);
    const tradePrice = matchOrder.price || incomingOrder.price;
    const totalValue = tradeQuantity * tradePrice;
    const fee = totalValue * (tradingPair.fee_percentage || 0.001);

    // Create trade record
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        trading_pair_id: incomingOrder.trading_pair_id,
        buyer_id: incomingOrder.side === 'buy' ? incomingOrder.user_id : matchOrder.user_id,
        seller_id: incomingOrder.side === 'sell' ? incomingOrder.user_id : matchOrder.user_id,
        order_id: matchOrder.id,
        price: tradePrice,
        quantity: tradeQuantity,
        total_value: totalValue,
        fee
      })
      .select()
      .single();

    if (!tradeError && trade) {
      trades.push(trade);

      // Update balances (simplified - in production, use proper ledger)
      await updateBalances(supabase, trade, tradingPair);

      // Update match order remaining quantity
      const newMatchRemaining = matchOrder.remaining_quantity - tradeQuantity;
      await supabase
        .from('orders')
        .update({ 
          remaining_quantity: newMatchRemaining,
          filled_quantity: matchOrder.quantity - newMatchRemaining,
          status: newMatchRemaining === 0 ? 'filled' : 'partial'
        })
        .eq('id', matchOrder.id);

      // Update incoming order remaining quantity
      remaining -= tradeQuantity;
      await supabase
        .from('orders')
        .update({ 
          remaining_quantity: remaining,
          filled_quantity: incomingOrder.quantity - remaining,
          status: remaining === 0 ? 'filled' : 'partial'
        })
        .eq('id', incomingOrder.id);
    }
  }

  return trades;
}

async function updateBalances(supabase: any, trade: any, tradingPair: any) {
  // Get base and quote tokens from trading pair
  const baseToken = tradingPair.base_token;
  const quoteToken = tradingPair.quote_token;

  // Update buyer balance (add base, subtract quote)
  await supabase.rpc('update_balance', {
    p_user_id: trade.buyer_id,
    p_token_symbol: baseToken,
    p_amount: trade.quantity
  });
  
  await supabase.rpc('update_balance', {
    p_user_id: trade.buyer_id,
    p_token_symbol: quoteToken,
    p_amount: -(trade.total_value + trade.fee)
  });

  // Update seller balance (subtract base, add quote)
  await supabase.rpc('update_balance', {
    p_user_id: trade.seller_id,
    p_token_symbol: baseToken,
    p_amount: -trade.quantity
  });
  
  await supabase.rpc('update_balance', {
    p_user_id: trade.seller_id,
    p_token_symbol: quoteToken,
    p_amount: trade.total_value - trade.fee
  });
}
