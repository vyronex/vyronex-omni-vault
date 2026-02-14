import { useQuery } from "@tanstack/react-query";

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coingecko-proxy`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
};

export async function fetchCoinGeckoData(endpoint: string, params: string) {
  const url = `${BASE_URL}?endpoint=${encodeURIComponent(endpoint)}&params=${encodeURIComponent(params)}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`CoinGecko proxy error: ${response.status}`);
  return response.json();
}

// Top coins by market cap
export function useMarketData(perPage = 50, page = 1) {
  return useQuery({
    queryKey: ["coingecko-markets", perPage, page],
    queryFn: () =>
      fetchCoinGeckoData(
        "coins/markets",
        `vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d`
      ),
    refetchInterval: 60000,
  });
}

// Global market overview (total market cap, volume, dominance)
export function useGlobalData() {
  return useQuery({
    queryKey: ["coingecko-global"],
    queryFn: () => fetchCoinGeckoData("global", ""),
    refetchInterval: 120000,
  });
}

// Trending coins
export function useTrending() {
  return useQuery({
    queryKey: ["coingecko-trending"],
    queryFn: () => fetchCoinGeckoData("search/trending", ""),
    refetchInterval: 300000,
  });
}

// Specific coin detail
export function useCoinDetail(coinId: string) {
  return useQuery({
    queryKey: ["coingecko-coin", coinId],
    queryFn: () =>
      fetchCoinGeckoData(
        `coins/${coinId}`,
        "localization=false&tickers=true&market_data=true&community_data=false&developer_data=false"
      ),
    enabled: !!coinId,
    refetchInterval: 60000,
  });
}

// Price chart data
export function useCoinChart(coinId: string, days = 7) {
  return useQuery({
    queryKey: ["coingecko-chart", coinId, days],
    queryFn: () =>
      fetchCoinGeckoData(
        `coins/${coinId}/market_chart`,
        `vs_currency=usd&days=${days}`
      ),
    enabled: !!coinId,
    refetchInterval: 300000,
  });
}

// Derivatives / Futures data
export function useDerivatives() {
  return useQuery({
    queryKey: ["coingecko-derivatives"],
    queryFn: () => fetchCoinGeckoData("derivatives", ""),
    refetchInterval: 60000,
  });
}

// Derivatives exchanges
export function useDerivativesExchanges() {
  return useQuery({
    queryKey: ["coingecko-derivatives-exchanges"],
    queryFn: () => fetchCoinGeckoData("derivatives/exchanges", "order=trade_volume_24h_btc_desc&per_page=10"),
    refetchInterval: 300000,
  });
}

// Exchange data
export function useExchanges() {
  return useQuery({
    queryKey: ["coingecko-exchanges"],
    queryFn: () => fetchCoinGeckoData("exchanges", "per_page=20&page=1"),
    refetchInterval: 300000,
  });
}
