import { useQuery } from "@tanstack/react-query";

const VNX_CONTRACT = "0xeb55a55c384095ced21587afbe7418b7c9ae40cb";

interface VNXPriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export const useVNXPrice = () => {
  return useQuery({
    queryKey: ["vnx-price"],
    queryFn: async (): Promise<VNXPriceData> => {
      try {
        // DexScreener public API — no key needed, supports BSC tokens
        const res = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${VNX_CONTRACT}`
        );
        const json = await res.json();
        const pair = json.pairs?.[0]; // most liquid pair

        if (pair) {
          return {
            price: parseFloat(pair.priceUsd) || 0,
            change24h: pair.priceChange?.h24 ?? 0,
            volume24h: pair.volume?.h24 ?? 0,
            marketCap: pair.marketCap ?? pair.fdv ?? 0,
          };
        }

        throw new Error("No pair found");
      } catch (error) {
        console.error("VNX DexScreener error, trying PancakeSwap:", error);

        // Fallback: PancakeSwap v2 API
        try {
          const res = await fetch(
            `https://api.pancakeswap.info/api/v2/tokens/${VNX_CONTRACT}`
          );
          const data = (await res.json()).data;
          return {
            price: parseFloat(data.price) || 0,
            change24h: parseFloat(data.price_change_24h) || 0,
            volume24h: parseFloat(data.total_volume) || 0,
            marketCap: parseFloat(data.market_cap) || 0,
          };
        } catch {
          // Last resort fallback
          return { price: 0, change24h: 0, volume24h: 0, marketCap: 0 };
        }
      }
    },
    refetchInterval: 30000,
  });
};
