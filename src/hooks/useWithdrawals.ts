import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  token_symbol: string;
  chain: string;
  amount: number;
  fee: number;
  net_amount: number;
  to_address: string;
  status: string;
  tx_hash: string | null;
  admin_notes: string | null;
  failure_reason: string | null;
  reviewed_at: string | null;
  broadcast_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface WithdrawalLimit {
  token_symbol: string;
  chain: string;
  min_amount: number;
  network_fee: number;
  daily_limit: number;
  is_enabled: boolean;
}

const readFunctionError = async (error: unknown): Promise<string> => {
  const fallback = error instanceof Error ? error.message : "Withdrawal request failed";
  const response = (error as { context?: Response } | null)?.context;
  if (!response) return fallback;

  try {
    const payload = await response.clone().json() as { error?: unknown };
    if (typeof payload.error === "string") return payload.error;
    if (payload.error && typeof payload.error === "object") return JSON.stringify(payload.error);
  } catch {
    // Keep the SDK's message when the response is not JSON.
  }
  return fallback;
};

export const useWithdrawalLimits = () =>
  useQuery({
    queryKey: ["withdrawal_limits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawal_limits")
        .select("*")
        .order("token_symbol");
      if (error) throw error;
      return (data ?? []) as WithdrawalLimit[];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useMyWithdrawals = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["withdrawals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as WithdrawalRequest[];
    },
  });
};

export const useAllWithdrawals = (statusFilter?: string) =>
  useQuery({
    queryKey: ["withdrawals_admin", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as WithdrawalRequest[];
    },
  });

export const useWithdrawActions = () => {
  const qc = useQueryClient();

  const request = useMutation({
    mutationFn: async (input: {
      token_symbol: string; chain: string; amount: number; to_address: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("withdraw-request", { body: input });
      if (error) throw new Error(await readFunctionError(error));
      if ((data as any)?.error) throw new Error(typeof (data as any).error === "string" ? (data as any).error : "Validation failed");
      return data as { request_id: string; fee: number; net_amount: number; expires_at: string; dev_code?: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const confirm = useMutation({
    mutationFn: async (input: { request_id: string; code: string }) => {
      const { data, error } = await supabase.functions.invoke("withdraw-confirm", { body: input });
      if (error) throw new Error(await readFunctionError(error));
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Withdrawal confirmed — awaiting admin review");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async (request_id: string) => {
      const { error } = await supabase.from("withdrawal_requests")
        .update({ status: "cancelled" }).eq("id", request_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Cancelled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adminAction = useMutation({
    mutationFn: async (input: {
      request_id: string;
      action: "approve" | "reject" | "mark_completed" | "mark_failed";
      notes?: string; tx_hash?: string; failure_reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("withdraw-admin", { body: input });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error(typeof (data as any).error === "string" ? (data as any).error : "Action failed");
      return data;
    },
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ["withdrawals_admin"] });
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success(d?.note ?? `Status: ${d?.status ?? "updated"}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { request, confirm, cancel, adminAction };
};
