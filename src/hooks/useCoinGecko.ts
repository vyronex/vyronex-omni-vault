export async function fetchCoinGeckoData(endpoint: string, params: string) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coingecko-proxy?endpoint=${encodeURIComponent(endpoint)}&params=${encodeURIComponent(params)}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko proxy error: ${response.status}`);
  }

  return response.json();
}
