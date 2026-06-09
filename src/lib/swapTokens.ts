// Curated on-chain token registry for the DEX swap UI.
// Native is represented by the OpenOcean placeholder address.
export const NATIVE_ADDR = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export interface SwapToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
}

export interface SwapChain {
  id: number;
  name: string;
  native: string;
  tokens: SwapToken[];
}

export const SWAP_CHAINS: SwapChain[] = [
  {
    id: 56,
    name: "BNB Chain",
    native: "BNB",
    tokens: [
      { symbol: "BNB", name: "BNB", address: NATIVE_ADDR, decimals: 18 },
      { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
      { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
      { symbol: "VNX", name: "VyronexVNX", address: "0xeb55a55c384095ced21587afbe7418b7c9ae40cb", decimals: 18 },
      { symbol: "CAKE", name: "PancakeSwap", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", decimals: 18 },
    ],
  },
  {
    id: 1,
    name: "Ethereum",
    native: "ETH",
    tokens: [
      { symbol: "ETH", name: "Ether", address: NATIVE_ADDR, decimals: 18 },
      { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
      { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
      { symbol: "DAI", name: "Dai", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
      { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
    ],
  },
  {
    id: 137,
    name: "Polygon",
    native: "MATIC",
    tokens: [
      { symbol: "MATIC", name: "Polygon", address: NATIVE_ADDR, decimals: 18 },
      { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
      { symbol: "USDC", name: "USD Coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
      { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18 },
    ],
  },
];

export const getChain = (id: number) => SWAP_CHAINS.find((c) => c.id === id) ?? SWAP_CHAINS[0];
