import { useQuery } from "@tanstack/react-query";
import { fetchCoinGeckoData } from "./useCoinGecko";

// CoinGecko IDs for native tokens + common tokens
const COIN_IDS = [
  "binancecoin",    // BNB
  "ethereum",       // ETH
  "fantom",         // FTM
  "bitcoin",        // BTC
  "solana",         // SOL
  "tron",           // TRX
  "tether",         // USDT
  "usd-coin",       // USDC
  "vyronex",        // VNX (may not exist on CoinGecko — will gracefully return 0)
];

const SYMBOL_TO_COINGECKO: Record<string, string> = {
  BNB: "binancecoin",
  ETH: "ethereum",
  FTM: "fantom",
  BTC: "bitcoin",
  SOL: "solana",
  TRX: "tron",
  USDT: "tether",
  USDC: "usd-coin",
  VNX: "vyronex",
};

export interface ChainPrices {
  /** Map from uppercase symbol (BNB, ETH, …) → USD price */
  bySymbol: Record<string, number>;
  /** Helper: get USD value for a symbol + amount */
  usdValue: (symbol: string, amount: number) => number;
}

export const useChainPrices = (): { data: ChainPrices | undefined; isLoading: boolean } => {
  const query = useQuery({
    queryKey: ["chain-prices"],
    queryFn: async () => {
      const ids = COIN_IDS.join(",");
      const raw = await fetchCoinGeckoData("simple/price", `ids=${ids}&vs_currencies=usd`);
      // raw: { binancecoin: { usd: 600 }, ... }
      const bySymbol: Record<string, number> = {};
      for (const [symbol, cgId] of Object.entries(SYMBOL_TO_COINGECKO)) {
        bySymbol[symbol] = raw?.[cgId]?.usd ?? 0;
      }
      return bySymbol;
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  const prices: ChainPrices | undefined = query.data
    ? {
        bySymbol: query.data,
        usdValue: (symbol: string, amount: number) =>
          (query.data[symbol.toUpperCase()] ?? 0) * amount,
      }
    : undefined;

  return { data: prices, isLoading: query.isLoading };
};
