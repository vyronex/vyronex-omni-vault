import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useApprovedListings, type TokenListing } from "./useTokenListings";

export interface ListedTokenPrice {
  listing: TokenListing;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  source: "coingecko" | "dexscreener" | "none";
}

export const useListingPrices = () => {
  const { data: listings } = useApprovedListings();

  return useQuery({
    queryKey: [
      "listing-prices",
      listings?.map((l) => `${l.chain}:${l.contract_address}`).join("|") ?? "",
    ],
    enabled: !!listings && listings.length > 0,
    refetchInterval: 60_000,
    queryFn: async (): Promise<ListedTokenPrice[]> => {
      if (!listings?.length) return [];
      const tokens = listings
        .filter((l) => !!l.contract_address)
        .map((l) => ({ chain: l.chain, address: l.contract_address }));

      const { data, error } = await supabase.functions.invoke("token-prices", {
        body: { tokens },
      });
      if (error) {
        return listings.map((listing) => ({
          listing, price: 0, change24h: 0, volume24h: 0, marketCap: 0, source: "none" as const,
        }));
      }

      const byKey = new Map<string, any>();
      for (const p of data?.prices ?? []) {
        byKey.set(`${p.chain}::${p.address.toLowerCase()}`, p);
      }
      return listings.map((listing) => {
        const k = `${listing.chain}::${listing.contract_address.toLowerCase()}`;
        const p = byKey.get(k);
        return {
          listing,
          price: p?.price ?? 0,
          change24h: p?.change24h ?? 0,
          volume24h: p?.volume24h ?? 0,
          marketCap: p?.marketCap ?? 0,
          source: (p?.source ?? "none") as ListedTokenPrice["source"],
        };
      });
    },
  });
};
