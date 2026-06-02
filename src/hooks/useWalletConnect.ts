import { useCallback, useEffect, useRef, useState } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

/**
 * WalletConnect v2 (EVM) hook.
 *
 * Lets users pair a remote wallet (Trust, Rainbow, Ledger Live, Zerion …)
 * via QR / deep-link and use it as an EIP-1193 provider for signing
 * messages and sending transactions.
 *
 * Requires a WalletConnect Cloud Project ID. The user supplies it once
 * via the UI and we persist it in localStorage under "wc:projectId".
 */

const STORAGE_KEY = "wc:projectId";
// Multi-chain EVM support: BSC, Ethereum, Fantom, Polygon, Arbitrum
const SUPPORTED_CHAINS = [56, 1, 250, 137, 42161];

export type WalletConnectStatus =
  | "idle"
  | "initializing"
  | "awaiting_uri"
  | "awaiting_approval"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface WCProviderLike {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  connect: (opts?: { optionalChains?: number[] }) => Promise<void>;
  disconnect: () => Promise<void>;
  accounts: string[];
  chainId: number;
  session?: unknown;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

export const useWalletConnect = () => {
  const [projectId, setProjectId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  });
  const [status, setStatus] = useState<WalletConnectStatus>("idle");
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pairingUri, setPairingUri] = useState<string | null>(null);

  const providerRef = useRef<WCProviderLike | null>(null);

  const persistProjectId = useCallback((id: string) => {
    setProjectId(id);
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const init = useCallback(async () => {
    if (providerRef.current || !projectId) return providerRef.current;
    setStatus("initializing");
    setError(null);
    try {
      const provider = (await EthereumProvider.init({
        projectId,
        chains: [56],
        optionalChains: SUPPORTED_CHAINS,
        showQrModal: false,
        metadata: {
          name: "VyronexVNX",
          description: "Multi-chain CEX & Wallet",
          url: typeof window !== "undefined" ? window.location.origin : "https://vyronex.app",
          icons: [
            typeof window !== "undefined"
              ? `${window.location.origin}/favicon.ico`
              : "",
          ],
        },
      })) as unknown as WCProviderLike;

      provider.on("display_uri", (...args: unknown[]) => {
        const uri = args[0] as string | undefined;
        if (uri) {
          setPairingUri(uri);
          setStatus("awaiting_approval");
        }
      });
      provider.on("accountsChanged", (...args: unknown[]) => {
        const accs = args[0] as string[] | undefined;
        setAccount(accs?.[0] ?? null);
        setStatus(accs?.[0] ? "connected" : "disconnected");
        if (accs?.[0]) setPairingUri(null);
      });
      provider.on("chainChanged", (...args: unknown[]) => {
        const raw = args[0];
        const id = typeof raw === "string" ? parseInt(raw, 16) : Number(raw);
        setChainId(Number.isFinite(id) ? id : null);
      });
      provider.on("disconnect", () => {
        setAccount(null);
        setChainId(null);
        setPairingUri(null);
        setStatus("disconnected");
      });

      providerRef.current = provider;

      // Resume existing session if any
      if (provider.accounts?.[0]) {
        setAccount(provider.accounts[0]);
        setChainId(provider.chainId);
        setStatus("connected");
      } else {
        setStatus("idle");
      }
      return provider;
    } catch (e) {
      setStatus("error");
      setError((e as { message?: string })?.message ?? "Init failed");
      return null;
    }
  }, [projectId]);

  // Auto-init on mount if we have a project id (to resume sessions)
  useEffect(() => {
    if (projectId && !providerRef.current) init();
  }, [projectId, init]);

  const connect = useCallback(async () => {
    if (!projectId) {
      setError("Set a WalletConnect Project ID first");
      return;
    }
    const provider = providerRef.current ?? (await init());
    if (!provider) return;
    setStatus("awaiting_uri");
    setError(null);
    setPairingUri(null);
    try {
      await provider.connect({ optionalChains: SUPPORTED_CHAINS });
      setAccount(provider.accounts?.[0] ?? null);
      setChainId(provider.chainId ?? null);
      setPairingUri(null);
      setStatus(provider.accounts?.[0] ? "connected" : "disconnected");
    } catch (e) {
      setStatus("error");
      setPairingUri(null);
      setError((e as { message?: string })?.message ?? "Connection rejected");
    }
  }, [init, projectId]);

  const cancelPairing = useCallback(() => {
    setPairingUri(null);
    setStatus("idle");
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await providerRef.current?.disconnect();
    } catch { /* ignore */ }
    setAccount(null);
    setChainId(null);
    setPairingUri(null);
    setStatus("disconnected");
  }, []);

  const switchChain = useCallback(async (chain: number) => {
    const provider = providerRef.current;
    if (!provider) throw new Error("Not initialized");
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chain.toString(16)}` }],
    });
    setChainId(chain);
  }, []);

  const sendTransaction = useCallback(
    async (params: { to: string; valueWei: string; data?: string }) => {
      const provider = providerRef.current;
      if (!provider || !account) throw new Error("Not connected");
      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: params.to,
            value: params.valueWei,
            ...(params.data ? { data: params.data } : {}),
          },
        ],
      })) as string;
      return txHash;
    },
    [account],
  );

  const signMessage = useCallback(
    async (message: string) => {
      const provider = providerRef.current;
      if (!provider || !account) throw new Error("Not connected");
      const hex = "0x" + Array.from(new TextEncoder().encode(message))
        .map((b) => b.toString(16).padStart(2, "0")).join("");
      return (await provider.request({
        method: "personal_sign",
        params: [hex, account],
      })) as string;
    },
    [account],
  );

  return {
    projectId,
    setProjectId: persistProjectId,
    status,
    account,
    chainId,
    error,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
    supportedChains: SUPPORTED_CHAINS,
  };
};
