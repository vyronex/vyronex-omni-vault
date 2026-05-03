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
  vnx_bonus_apr: number;
  tvl: number;
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
  vnx_reward: number;
  status: string;
  created_at: string;
  strategy?: VaultStrategy;
}

export const useVault = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ["vault-strategies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vault_strategies")
        .select("*")
        .eq("is_active", true)
        .order("apr_percent", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((d: any) => ({
        ...d,
        apr_percent: Number(d.apr_percent),
        penalty_percent: Number(d.penalty_percent),
        vnx_bonus_apr: Number(d.vnx_bonus_apr),
        tvl: Number(d.tvl),
      })) as VaultStrategy[];
    },
  });

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
        vnx_reward: Number(d.vnx_reward),
        strategy: d.vault_strategies ? {
          ...d.vault_strategies,
          apr_percent: Number(d.vault_strategies.apr_percent),
          penalty_percent: Number(d.vault_strategies.penalty_percent),
          vnx_bonus_apr: Number(d.vault_strategies.vnx_bonus_apr),
          tvl: Number(d.vault_strategies.tvl),
        } : undefined,
      })) as VaultDeposit[];
    },
    enabled: !!user,
  });

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

  const createDeposit = useMutation({
    mutationFn: async (params: { strategyId: string; amount: number; lockDays: number; tokenSymbol: string }) => {
      const unlockAt = new Date();
      unlockAt.setDate(unlockAt.getDate() + params.lockDays);

      const strategy = strategies?.find((s) => s.id === params.strategyId);
      const apr = strategy?.apr_percent ?? 0;
      const bonusApr = strategy?.vnx_bonus_apr ?? 0;
      const earned = params.amount * (apr / 100) * (params.lockDays / 365);
      const vnxReward = params.amount * (bonusApr / 100) * (params.lockDays / 365);

      const { data, error } = await supabase.from("vault_deposits").insert({
        user_id: user!.id,
        strategy_id: params.strategyId,
        amount: params.amount,
        token_symbol: params.tokenSymbol,
        unlock_at: unlockAt.toISOString(),
        earned_amount: earned,
        vnx_reward: vnxReward,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vault-deposits", user?.id] });
      toast.success("Vault deposit created — VNX bonus rewards activated");
    },
    onError: (err: any) => toast.error(err?.message ?? "Failed to create deposit"),
  });

  const withdrawDeposit = useMutation({
    mutationFn: async (depositId: string) => {
      const dep = deposits?.find((d) => d.id === depositId);
      if (!dep) throw new Error("Deposit not found");

      const now = new Date();
      const isEarly = now < new Date(dep.unlock_at);

      let finalEarned = dep.earned_amount;
      let finalVnxReward = dep.vnx_reward;
      if (isEarly) {
        const penalty = dep.strategy?.penalty_percent ?? 10;
        finalEarned = Math.max(0, finalEarned * (1 - penalty / 100));
        finalVnxReward = Math.max(0, finalVnxReward * (1 - penalty / 100));
      }

      const { error } = await supabase
        .from("vault_deposits")
        .update({
          status: isEarly ? "early_withdrawn" : "withdrawn",
          withdrawn_at: now.toISOString(),
          earned_amount: finalEarned,
          vnx_reward: finalVnxReward,
        })
        .eq("id", depositId)
        .eq("user_id", user!.id);

      if (error) throw error;
      return { isEarly, finalEarned, finalVnxReward };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["vault-deposits", user?.id] });
      if (result.isEarly) {
        toast.warning("Early withdrawal — penalty applied to earnings & VNX rewards");
      } else {
        toast.success(`Vault withdrawal completed — ${result.finalVnxReward.toFixed(2)} VNX bonus claimed`);
      }
    },
    onError: (err: any) => toast.error(err?.message ?? "Withdrawal failed"),
  });

  // Computed stats
  const activeDeposits = deposits?.filter((d) => d.status === "active") ?? [];
  const totalDeposited = activeDeposits.reduce((s, d) => s + d.amount, 0);
  const totalEarnings = deposits?.reduce((s, d) => s + d.earned_amount, 0) ?? 0;
  const totalVnxRewards = deposits?.reduce((s, d) => s + d.vnx_reward, 0) ?? 0;
  const activeCount = activeDeposits.length;
  const platformTvl = strategies?.reduce((s, st) => s + st.tvl, 0) ?? 0;
  const weightedApy = strategies && strategies.length > 0
    ? strategies.reduce((s, st) => s + st.apr_percent * st.tvl, 0) / Math.max(platformTvl, 1)
    : 0;

  return {
    strategies,
    deposits,
    strategiesLoading,
    depositsLoading,
    createDeposit,
    withdrawDeposit,
    totalDeposited,
    totalEarnings,
    totalVnxRewards,
    activeCount,
    platformTvl,
    weightedApy,
  };
};
