import { useQuery } from "@tanstack/react-query";
import { fetchCoinGeckoData } from "./useCoinGecko";
import { useApprovedListings, type TokenListing } from "./useTokenListings";

// Map our chain labels to CoinGecko asset-platform IDs
const PLATFORM: Record<string, string> = {
  "BNB Chain": "binance-smart-chain",
  Ethereum: "ethereum",
  Polygon: "polygon-pos",
  Fantom: "fantom",
  Solana: "solana",
  Tron: "tron",
  Avalanche: "avalanche",
  Arbitrum: "arbitrum-one",
  Optimism: "optimistic-ethereum",
  Base: "base",
};

export interface ListedTokenPrice {
  listing: TokenListing;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export const useListingPrices = () => {
  const { data: listings } = useApprovedListings();

  const query = useQuery({
    queryKey: [
      "listing-prices",
      listings?.map((l) => `${l.chain}:${l.contract_address}`).join("|") ?? "",
    ],
    enabled: !!listings && listings.length > 0,
    refetchInterval: 60_000,
    queryFn: async (): Promise<ListedTokenPrice[]> => {
      if (!listings?.length) return [];
      // Group contract addresses by platform
      const groups = new Map<string, TokenListing[]>();
      for (const l of listings) {
        const platform = PLATFORM[l.chain];
        if (!platform || !l.contract_address) continue;
        const arr = groups.get(platform) ?? [];
        arr.push(l);
        groups.set(platform, arr);
      }

      const results: ListedTokenPrice[] = [];
      for (const [platform, items] of groups.entries()) {
        const addrs = items
          .map((i) => i.contract_address.toLowerCase())
          .join(",");
        try {
          const raw = await fetchCoinGeckoData(
            `simple/token_price/${platform}`,
            `contract_addresses=${addrs}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
          );
          for (const l of items) {
            const k = l.contract_address.toLowerCase();
            const r = raw?.[k];
            results.push({
              listing: l,
              price: r?.usd ?? 0,
              change24h: r?.usd_24h_change ?? 0,
              volume24h: r?.usd_24h_vol ?? 0,
              marketCap: r?.usd_market_cap ?? 0,
            });
          }
        } catch {
          for (const l of items) {
            results.push({ listing: l, price: 0, change24h: 0, volume24h: 0, marketCap: 0 });
          }
        }
      }
      return results;
    },
  });

  return query;
};
