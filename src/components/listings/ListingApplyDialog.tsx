import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSubmitListing } from "@/hooks/useTokenListings";
import { useValidateTokenMutation, type TokenValidation } from "@/hooks/useTokenValidation";

const CHAINS = ["BNB Chain", "Ethereum", "Fantom", "Polygon", "Arbitrum", "Solana", "Tron", "Bitcoin"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const ListingApplyDialog = ({ open, onOpenChange }: Props) => {
  const submit = useSubmitListing();
  const validate = useValidateTokenMutation();
  const [validation, setValidation] = useState<TokenValidation | null>(null);
  const [form, setForm] = useState({
    project_name: "",
    token_symbol: "",
    token_name: "",
    chain: "BNB Chain",
    contract_address: "",
    decimals: "18",
    total_supply: "",
    website: "",
    whitepaper: "",
    telegram: "",
    twitter: "",
    github: "",
    description: "",
    logo_url: "",
  });

  // Reset validation whenever chain or address change
  useEffect(() => { setValidation(null); }, [form.chain, form.contract_address]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const runValidate = async () => {
    if (!form.contract_address.trim()) {
      toast.error("Enter a contract address first");
      return;
    }
    try {
      const v = await validate.mutateAsync({ chain: form.chain, address: form.contract_address.trim() });
      setValidation(v);
      if (v.valid) {
        toast.success(`Verified on-chain: ${v.symbol}`);
        setForm((f) => ({
          ...f,
          token_symbol: v.symbol ?? f.token_symbol,
          token_name: v.name ?? f.token_name,
          decimals: v.decimals != null ? String(v.decimals) : f.decimals,
          total_supply: v.totalSupply && v.decimals != null
            ? String(Number(BigInt(v.totalSupply) / BigInt(10) ** BigInt(Math.min(v.decimals, 18))))
            : f.total_supply,
        }));
      } else {
        toast.error(v.error ?? "Validation failed");
      }
    } catch (e) {
      toast.error((e as Error).message ?? "Validation failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name || !form.token_symbol || !form.token_name || !form.contract_address) {
      toast.error("Project name, symbol, token name, and contract are required");
      return;
    }
    if (!validation?.valid) {
      toast.error("Validate the contract on-chain before submitting");
      return;
    }
    try {
      await submit.mutateAsync({
        project_name: form.project_name.trim(),
        token_symbol: form.token_symbol.trim().toUpperCase(),
        token_name: form.token_name.trim(),
        chain: form.chain,
        contract_address: form.contract_address.trim(),
        decimals: parseInt(form.decimals, 10) || 18,
        total_supply: form.total_supply ? Number(form.total_supply) : null,
        website: form.website || null,
        whitepaper: form.whitepaper || null,
        telegram: form.telegram || null,
        twitter: form.twitter || null,
        github: form.github || null,
        description: form.description || null,
        logo_url: form.logo_url || null,
      });
      toast.success("Listing application submitted — admins will review shortly");
      onOpenChange(false);
      setForm((f) => ({ ...f, project_name: "", token_symbol: "", token_name: "", contract_address: "", description: "" }));
    } catch (err) {
      toast.error((err as Error).message ?? "Submission failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            Apply to List Token
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submit your token for review. The VyronexVNX team reviews applications within 5 business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Project Name *</Label>
              <Input value={form.project_name} onChange={update("project_name")} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Token Name *</Label>
              <Input value={form.token_name} onChange={update("token_name")} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Symbol *</Label>
              <Input
                value={form.token_symbol}
                onChange={update("token_symbol")}
                className="h-9 mt-1 uppercase"
                maxLength={12}
              />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Chain *</Label>
              <select
                value={form.chain}
                onChange={(e) => setForm((f) => ({ ...f, chain: e.target.value }))}
                className="h-9 mt-1 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CHAINS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-[11px] uppercase tracking-wider">Contract Address *</Label>
              <Input
                value={form.contract_address}
                onChange={update("contract_address")}
                className="h-9 mt-1 font-mono text-xs"
                placeholder="0x… / mint address"
              />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Decimals</Label>
              <Input type="number" value={form.decimals} onChange={update("decimals")} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Total Supply</Label>
              <Input type="number" value={form.total_supply} onChange={update("total_supply")} className="h-9 mt-1" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Website</Label>
              <Input value={form.website} onChange={update("website")} className="h-9 mt-1" placeholder="https://" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Whitepaper</Label>
              <Input value={form.whitepaper} onChange={update("whitepaper")} className="h-9 mt-1" placeholder="https://" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Twitter</Label>
              <Input value={form.twitter} onChange={update("twitter")} className="h-9 mt-1" placeholder="@handle or url" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Telegram</Label>
              <Input value={form.telegram} onChange={update("telegram")} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">GitHub</Label>
              <Input value={form.github} onChange={update("github")} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider">Logo URL</Label>
              <Input value={form.logo_url} onChange={update("logo_url")} className="h-9 mt-1" placeholder="https://" />
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase tracking-wider">Project Description</Label>
            <Textarea
              value={form.description}
              onChange={update("description")}
              rows={4}
              className="mt-1 text-sm"
              placeholder="Brief overview of the project, use cases, and team."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submit.isPending} className="gradient-primary shadow-glow">
              {submit.isPending ? "Submitting…" : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
