import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ListingStatus = "pending" | "approved" | "rejected";

export interface TokenListing {
  id: string;
  submitted_by: string | null;
  project_name: string;
  token_symbol: string;
  token_name: string;
  chain: string;
  contract_address: string;
  decimals: number;
  total_supply: number | null;
  website: string | null;
  whitepaper: string | null;
  telegram: string | null;
  twitter: string | null;
  github: string | null;
  description: string | null;
  logo_url: string | null;
  status: ListingStatus;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewListingInput {
  project_name: string;
  token_symbol: string;
  token_name: string;
  chain: string;
  contract_address: string;
  decimals: number;
  total_supply?: number | null;
  website?: string | null;
  whitepaper?: string | null;
  telegram?: string | null;
  twitter?: string | null;
  github?: string | null;
  description?: string | null;
  logo_url?: string | null;
}

export const useApprovedListings = () => {
  return useQuery({
    queryKey: ["token_listings", "approved"],
    queryFn: async (): Promise<TokenListing[]> => {
      const { data, error } = await supabase
        .from("token_listings")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TokenListing[];
    },
    staleTime: 30_000,
  });
};

export const useMyListings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["token_listings", "mine", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TokenListing[]> => {
      const { data, error } = await supabase
        .from("token_listings")
        .select("*")
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TokenListing[];
    },
  });
};

export const useSubmitListing = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewListingInput) => {
      if (!user) throw new Error("You must be signed in to submit a listing");
      const payload = {
        ...input,
        submitted_by: user.id,
        status: "pending" as ListingStatus,
      };
      const { data, error } = await supabase
        .from("token_listings")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as TokenListing;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["token_listings"] });
    },
  });
};
