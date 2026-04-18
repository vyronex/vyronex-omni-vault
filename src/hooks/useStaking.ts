import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { z } from "zod";

export interface StakingPool {
  id: string;
  name: string;
  apr: number;
  lockup_days: number;
  lockup_label: string;
}

export const STAKING_POOLS: StakingPool[] = [
  { id: "flexible", name: "VNX Standard Pool", apr: 12.5, lockup_days: 0, lockup_label: "Flexible" },
  { id: "30d", name: "VNX Premium Pool", apr: 18.0, lockup_days: 30, lockup_label: "30 days" },
  { id: "90d", name: "VNX Elite Pool", apr: 25.0, lockup_days: 90, lockup_label: "90 days" },
  { id: "365d", name: "VNX Diamond Pool", apr: 30.0, lockup_days: 365, lockup_label: "365 days" },
];

const stakeSchema = z.object({
  amount: z.number().positive().finite().min(1, "Minimum stake is 1 VNX").max(10_000_000),
  lock_period_days: z.number().int().min(0).max(3650),
  apr: z.number().positive().max(100),
});

export interface StakingRecord {
  id: string;
  user_id: string;
  token_symbol: string;
  amount: number;
  apr: number;
  lock_period_days: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  rewards_earned: number | null;
  created_at: string | null;
}

/**
 * Calculate accrued rewards for an active stake based on elapsed time.
 * Continuous APR: rewards = amount * apr/100 * (elapsedSeconds / yearSeconds)
 */
export const calculateAccruedRewards = (record: StakingRecord): number => {
  if (record.status !== "active" || !record.start_date) {
    return Number(record.rewards_earned ?? 0);
  }
  const start = new Date(record.start_date).getTime();
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - start) / 1000);
  const yearSec = 365 * 24 * 60 * 60;
  const accrued = Number(record.amount) * (Number(record.apr) / 100) * (elapsedSec / yearSec);
  return accrued + Number(record.rewards_earned ?? 0);
};

export const isUnlocked = (record: StakingRecord): boolean => {
  if (record.lock_period_days === 0) return true;
  if (!record.end_date) return true;
  return Date.now() >= new Date(record.end_date).getTime();
};

export const useStaking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["staking"] });
    queryClient.invalidateQueries({ queryKey: ["balances"] });
  };

  // ─── Read all staking records ────────────────────────────────────────
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["staking", user?.id],
    queryFn: async () => {
      if (!user) return [] as StakingRecord[];
      const { data, error } = await supabase
        .from("staking_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StakingRecord[];
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const activeStakes = records.filter(r => r.status === "active");
  const totalStaked = activeStakes.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalAccruedRewards = activeStakes.reduce((sum, r) => sum + calculateAccruedRewards(r), 0);

  // ─── STAKE ───────────────────────────────────────────────────────────
  const stake = useMutation({
    mutationFn: async (input: { amount: number; lock_period_days: number; apr: number }) => {
      if (!user) throw new Error("Not authenticated");
      const parsed = stakeSchema.safeParse(input);
      if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");

      // Check VNX balance
      const { data: balanceRow } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .eq("token_symbol", "VNX")
        .maybeSingle();

      const currentBalance = Number(balanceRow?.balance ?? 0);
      if (currentBalance < parsed.data.amount) {
        throw new Error(`Insufficient VNX balance (have ${currentBalance.toFixed(2)})`);
      }

      // Debit VNX from spendable balance
      const { error: debitError } = await supabase.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: "VNX",
        p_amount: -Math.abs(parsed.data.amount),
      });
      if (debitError) throw debitError;

      // Create staking record
      const start = new Date();
      const end = parsed.data.lock_period_days > 0
        ? new Date(start.getTime() + parsed.data.lock_period_days * 24 * 60 * 60 * 1000)
        : null;

      const { error } = await supabase.from("staking_records").insert({
        user_id: user.id,
        token_symbol: "VNX",
        amount: parsed.data.amount,
        apr: parsed.data.apr,
        lock_period_days: parsed.data.lock_period_days,
        status: "active",
        start_date: start.toISOString(),
        end_date: end?.toISOString() ?? null,
        rewards_earned: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stake created successfully");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── CLAIM REWARDS ───────────────────────────────────────────────────
  const claimRewards = useMutation({
    mutationFn: async (recordId: string) => {
      if (!user) throw new Error("Not authenticated");
      const record = records.find(r => r.id === recordId);
      if (!record) throw new Error("Stake not found");
      if (record.status !== "active") throw new Error("Stake is not active");

      const accrued = calculateAccruedRewards(record);
      const previously = Number(record.rewards_earned ?? 0);
      const claimable = accrued - previously;
      if (claimable < 0.0001) throw new Error("No rewards to claim yet");

      // Credit VNX rewards
      const { error: creditError } = await supabase.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: "VNX",
        p_amount: claimable,
      });
      if (creditError) throw creditError;

      // Reset start_date so future accrual restarts; keep total in rewards_earned
      const { error } = await supabase
        .from("staking_records")
        .update({
          rewards_earned: accrued,
          start_date: new Date().toISOString(),
        })
        .eq("id", recordId)
        .eq("user_id", user.id);
      if (error) throw error;

      return claimable;
    },
    onSuccess: (claimed) => {
      toast.success(`Claimed ${claimed.toFixed(4)} VNX`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── UNSTAKE ─────────────────────────────────────────────────────────
  const unstake = useMutation({
    mutationFn: async (recordId: string) => {
      if (!user) throw new Error("Not authenticated");
      const record = records.find(r => r.id === recordId);
      if (!record) throw new Error("Stake not found");
      if (record.status !== "active") throw new Error("Stake is not active");
      if (!isUnlocked(record)) {
        const endDate = record.end_date ? new Date(record.end_date).toLocaleDateString() : "lock end";
        throw new Error(`Stake is locked until ${endDate}`);
      }

      const accrued = calculateAccruedRewards(record);
      const principal = Number(record.amount);
      const totalReturn = principal + accrued;

      // Credit principal + final rewards
      const { error: creditError } = await supabase.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: "VNX",
        p_amount: totalReturn,
      });
      if (creditError) throw creditError;

      // Mark complete
      const { error } = await supabase
        .from("staking_records")
        .update({
          status: "completed",
          rewards_earned: accrued,
          end_date: new Date().toISOString(),
        })
        .eq("id", recordId)
        .eq("user_id", user.id);
      if (error) throw error;

      return { principal, accrued };
    },
    onSuccess: ({ principal, accrued }) => {
      toast.success(`Unstaked ${principal.toFixed(2)} VNX + ${accrued.toFixed(4)} rewards`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    records,
    activeStakes,
    totalStaked,
    totalAccruedRewards,
    isLoading,
    stake,
    claimRewards,
    unstake,
  };
};
