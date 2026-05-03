import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";
import { toast } from "sonner";

export interface VaultStrategy {
  id: string;
  name: string;
  description: string | null;
  token_symbol: string;
  apr_percent: number;
  min_lock_days: number;
  max_lock_days: number;
  penalty_percent: number;
}

export interface VaultDeposit {
  id: string;
  user_id: string;
  strategy_id: string;
  amount: number;
  token_symbol: string;
  locked_at: string;
  unlock_at: string;
  withdrawn_at: string | null;
  earned_amount: number;
  status: string;
  created_at: string;
  strategy?: VaultStrategy;
}

export const useVault = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Fetch strategies
  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ["vault-strategies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vault_strategies")
        .select("*")
        .eq("is_active", true)
        .order("apr_percent", { ascending: true });
      if (error) throw error;
      return data as VaultStrategy[];
    },
  });

  // Fetch user deposits
  const { data: deposits, isLoading: depositsLoading } = useQuery({
    queryKey: ["vault-deposits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vault_deposits")
        .select("*, vault_strategies(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((d: any) => ({
        ...d,
        amount: Number(d.amount),
        earned_amount: Number(d.earned_amount),
        strategy: d.vault_strategies as VaultStrategy,
      })) as VaultDeposit[];
    },
    enabled: !!user,
  });

  // Realtime subscription for deposits
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`vault-deposits-${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "vault_deposits",
        filter: `user_id=eq.${user.id}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["vault-deposits", user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, qc]);

  // Create deposit
  const createDeposit = useMutation({
    mutationFn: async (params: { strategyId: string; amount: number; lockDays: number; tokenSymbol: string }) => {
      const unlockAt = new Date();
      unlockAt.setDate(unlockAt.getDate() + params.lockDays);

      // Calculate projected earnings (simple interest)
      const strategy = strategies?.find((s) => s.id === params.strategyId);
      const apr = strategy?.apr_percent ?? 0;
      const earned = params.amount * (apr / 100) * (params.lockDays / 365);

      const { data, error } = await supabase.from("vault_deposits").insert({
        user_id: user!.id,
        strategy_id: params.strategyId,
        amount: params.amount,
        token_symbol: params.tokenSymbol,
        unlock_at: unlockAt.toISOString(),
        earned_amount: earned,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vault-deposits", user?.id] });
      toast.success("Vault deposit created successfully");
    },
    onError: (err: any) => toast.error(err?.message ?? "Failed to create deposit"),
  });

  // Withdraw deposit
  const withdrawDeposit = useMutation({
    mutationFn: async (depositId: string) => {
      const dep = deposits?.find((d) => d.id === depositId);
      if (!dep) throw new Error("Deposit not found");

      const now = new Date();
      const unlockDate = new Date(dep.unlock_at);
      const isEarly = now < unlockDate;

      let finalEarned = dep.earned_amount;
      if (isEarly) {
        const strategy = dep.strategy ?? strategies?.find((s) => s.id === dep.strategy_id);
        const penalty = strategy?.penalty_percent ?? 10;
        finalEarned = Math.max(0, finalEarned * (1 - penalty / 100));
      }

      const { error } = await supabase
        .from("vault_deposits")
        .update({
          status: isEarly ? "early_withdrawn" : "withdrawn",
          withdrawn_at: now.toISOString(),
          earned_amount: finalEarned,
        })
        .eq("id", depositId)
        .eq("user_id", user!.id);

      if (error) throw error;
      return { isEarly, finalEarned };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["vault-deposits", user?.id] });
      if (result.isEarly) {
        toast.warning("Early withdrawal — penalty applied to earnings");
      } else {
        toast.success("Vault withdrawal completed");
      }
    },
    onError: (err: any) => toast.error(err?.message ?? "Withdrawal failed"),
  });

  // Computed stats
  const totalDeposited = deposits?.filter((d) => d.status === "active").reduce((s, d) => s + d.amount, 0) ?? 0;
  const totalEarnings = deposits?.reduce((s, d) => s + d.earned_amount, 0) ?? 0;
  const activeCount = deposits?.filter((d) => d.status === "active").length ?? 0;

  return {
    strategies,
    deposits,
    strategiesLoading,
    depositsLoading,
    createDeposit,
    withdrawDeposit,
    totalDeposited,
    totalEarnings,
    activeCount,
  };
};
