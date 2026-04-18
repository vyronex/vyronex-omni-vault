import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { z } from "zod";

/**
 * Address format validation per chain. Permissive but catches typos.
 */
const addressPatterns: Record<string, RegExp> = {
  "BNB Chain": /^0x[a-fA-F0-9]{40}$/,
  Ethereum: /^0x[a-fA-F0-9]{40}$/,
  Fantom: /^0x[a-fA-F0-9]{40}$/,
  Bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  Tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
};

export const validateAddress = (address: string, chain: string): string | null => {
  if (!address || address.trim().length === 0) return "Address is required";
  const pattern = addressPatterns[chain];
  if (pattern && !pattern.test(address.trim())) {
    return `Invalid ${chain} address format`;
  }
  return null;
};

const depositSchema = z.object({
  token_symbol: z.string().min(1).max(10),
  amount: z.number().positive().finite().max(1_000_000_000),
  tx_hash: z.string().min(8).max(128),
});

const withdrawSchema = z.object({
  token_symbol: z.string().min(1).max(10),
  amount: z.number().positive().finite().max(1_000_000_000),
  to_address: z.string().min(8).max(128),
  chain: z.string().min(1),
});

const transferSchema = z.object({
  token_symbol: z.string().min(1).max(10),
  amount: z.number().positive().finite().max(1_000_000_000),
  recipient_username: z.string().trim().min(1).max(255),
});

/**
 * Wallet actions: deposit (record pending tx), withdraw (debit + pending tx),
 * internal transfer (debit sender + credit recipient by username).
 */
export const useWalletActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ensurePrimaryWallet = async () => {
    const { data: existing } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user!.id)
      .eq("is_primary", true)
      .maybeSingle();
    if (existing) return existing;

    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: user!.id,
        chain: "BNB Chain",
        address: "pending",
        is_primary: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["wallets"] });
    queryClient.invalidateQueries({ queryKey: ["balances"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  // ─── DEPOSIT (manual: user reports tx hash) ──────────────────────────
  const deposit = useMutation({
    mutationFn: async (input: { token_symbol: string; amount: number; tx_hash: string }) => {
      if (!user) throw new Error("Not authenticated");
      const parsed = depositSchema.safeParse(input);
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
      }
      const wallet = await ensurePrimaryWallet();

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        wallet_id: wallet.id,
        tx_hash: parsed.data.tx_hash.trim(),
        tx_type: "deposit",
        from_address: "external",
        to_address: wallet.address,
        token_symbol: parsed.data.token_symbol.toUpperCase(),
        amount: parsed.data.amount,
        chain: wallet.chain,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deposit submitted — awaiting confirmation");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── WITHDRAW (debit balance + create pending tx) ────────────────────
  const withdraw = useMutation({
    mutationFn: async (input: { token_symbol: string; amount: number; to_address: string; chain: string }) => {
      if (!user) throw new Error("Not authenticated");
      const parsed = withdrawSchema.safeParse(input);
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
      }
      const addrError = validateAddress(parsed.data.to_address, parsed.data.chain);
      if (addrError) throw new Error(addrError);

      const wallet = await ensurePrimaryWallet();

      // Check balance
      const { data: balanceRow } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .eq("token_symbol", parsed.data.token_symbol.toUpperCase())
        .maybeSingle();

      const currentBalance = Number(balanceRow?.balance ?? 0);
      if (currentBalance < parsed.data.amount) {
        throw new Error(`Insufficient ${parsed.data.token_symbol} balance (have ${currentBalance})`);
      }

      // Debit via secure RPC (handles audit log + negative-balance prevention)
      const { error: rpcError } = await supabase.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: parsed.data.token_symbol.toUpperCase(),
        p_amount: -Math.abs(parsed.data.amount),
      });
      if (rpcError) throw rpcError;

      // Pending withdrawal record
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        wallet_id: wallet.id,
        tx_hash: `withdraw-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        tx_type: "withdraw",
        from_address: wallet.address,
        to_address: parsed.data.to_address.trim(),
        token_symbol: parsed.data.token_symbol.toUpperCase(),
        amount: parsed.data.amount,
        chain: parsed.data.chain,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── INTERNAL TRANSFER (by username) ─────────────────────────────────
  const transfer = useMutation({
    mutationFn: async (input: { token_symbol: string; amount: number; recipient_username: string }) => {
      if (!user) throw new Error("Not authenticated");
      const parsed = transferSchema.safeParse(input);
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
      }

      const recipientQuery = parsed.data.recipient_username.trim();

      // Lookup recipient profile by username (or email-as-username from signup)
      const { data: recipient, error: lookupError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", recipientQuery)
        .maybeSingle();

      if (lookupError) throw lookupError;
      if (!recipient) throw new Error(`User "${recipientQuery}" not found`);
      if (recipient.id === user.id) throw new Error("Cannot transfer to yourself");

      const symbol = parsed.data.token_symbol.toUpperCase();

      // Check sender balance
      const { data: balanceRow } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .eq("token_symbol", symbol)
        .maybeSingle();

      const currentBalance = Number(balanceRow?.balance ?? 0);
      if (currentBalance < parsed.data.amount) {
        throw new Error(`Insufficient ${symbol} balance (have ${currentBalance})`);
      }

      // Debit sender (audit-logged via RPC)
      const { error: debitError } = await supabase.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: symbol,
        p_amount: -Math.abs(parsed.data.amount),
      });
      if (debitError) throw debitError;

      // Note: crediting recipient via RPC is blocked by the auth.uid() check
      // in update_balance. We record a pending internal-transfer transaction
      // for the sender; the recipient credit is processed off-chain by service role.
      const wallet = await ensurePrimaryWallet();
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        wallet_id: wallet.id,
        tx_hash: `internal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        tx_type: "transfer",
        from_address: user.id,
        to_address: recipient.id,
        token_symbol: symbol,
        amount: parsed.data.amount,
        chain: "internal",
        status: "pending",
      });
      if (txError) throw txError;

      return { recipient: recipient.username };
    },
    onSuccess: (data) => {
      toast.success(`Transfer to ${data.recipient} submitted`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { deposit, withdraw, transfer };
};
