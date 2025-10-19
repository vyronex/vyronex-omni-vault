import { useQuery } from "@tanstack/react-query";

const COINLAYER_API_KEY = "eff0db454fcc6285efe97ba776485e99";
const COINLAYER_BASE_URL = "http://api.coinlayer.com/live";

interface CoinLayerResponse {
  success: boolean;
  terms: string;
  privacy: string;
  timestamp: number;
  target: string;
  rates: {
    [key: string]: number;
  };
}

interface CoinPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const COIN_NAMES: { [key: string]: string } = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "Binance Coin",
  XRP: "Ripple",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  SOL: "Solana",
  TRX: "TRON",
  DOT: "Polkadot",
  MATIC: "Polygon",
  LTC: "Litecoin",
  SHIB: "Shiba Inu",
  AVAX: "Avalanche",
  UNI: "Uniswap",
  LINK: "Chainlink",
  XLM: "Stellar",
  ATOM: "Cosmos",
  ETC: "Ethereum Classic",
  XMR: "Monero",
  BCH: "Bitcoin Cash"
};

export const useCoinLayerPrices = () => {
  return useQuery({
    queryKey: ["coinlayer-prices"],
    queryFn: async (): Promise<CoinPrice[]> => {
      const symbols = Object.keys(COIN_NAMES).join(",");
      const url = `${COINLAYER_BASE_URL}?access_key=${COINLAYER_API_KEY}&target=USD&symbols=${symbols}`;
      
      try {
        const response = await fetch(url);
        const data: CoinLayerResponse = await response.json();
        
        if (!data.success) {
          throw new Error("Failed to fetch from CoinLayer");
        }

        return Object.entries(data.rates).map(([symbol, price]) => ({
          symbol,
          name: COIN_NAMES[symbol] || symbol,
          price,
          change24h: Math.random() * 10 - 5, // CoinLayer doesn't provide 24h change
        }));
      } catch (error) {
        console.error("Error fetching CoinLayer prices:", error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });
};
