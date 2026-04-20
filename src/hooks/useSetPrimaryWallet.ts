import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

/**
 * Marks a single wallet as primary, demoting all others for the user.
 */
export const useSetPrimaryWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error: clearError } = await supabase
        .from("wallets")
        .update({ is_primary: false })
        .eq("user_id", user.id);
      if (clearError) throw clearError;

      const { error } = await supabase
        .from("wallets")
        .update({ is_primary: true })
        .eq("id", walletId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Primary wallet updated");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
