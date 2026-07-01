import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useWithdrawalLimits, useWithdrawActions } from "@/hooks/useWithdrawals";
import { validateAddress } from "@/hooks/useWalletActions";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

type Step = "form" | "review" | "confirm" | "done";

export const WithdrawDialogV2 = ({ open, onOpenChange }: Props) => {
  const { data: limits } = useWithdrawalLimits();
  const { request, confirm } = useWithdrawActions();

  const [step, setStep] = useState<Step>("form");
  const [token, setToken] = useState("VNX");
  const [chain, setChain] = useState("BNB Chain");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  const [requestId, setRequestId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (step !== "confirm" || !expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, expiresAt]);

  const reset = () => {
    setStep("form"); setToken("VNX"); setChain("BNB Chain");
    setAddress(""); setAmount(""); setAddressError(null);
    setRequestId(null); setDevCode(null); setCode(""); setExpiresAt(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const tokenOptions = useMemo(
    () => Array.from(new Set((limits ?? []).map((l) => l.token_symbol))),
    [limits],
  );
  const chainOptions = useMemo(
    () => (limits ?? []).filter((l) => l.token_symbol === token && l.is_enabled).map((l) => l.chain),
    [limits, token],
  );

  const currentLimit = useMemo(
    () => (limits ?? []).find((l) => l.token_symbol === token && l.chain === chain),
    [limits, token, chain],
  );

  const amt = parseFloat(amount) || 0;
  const fee = Number(currentLimit?.network_fee ?? 0);
  const net = Math.max(0, amt - fee);
  const belowMin = currentLimit && amt < Number(currentLimit.min_amount);

  const handleReview = () => {
    const err = validateAddress(address, chain);
    setAddressError(err);
    if (err) return;
    if (!currentLimit) { toast.error("Select a supported token/network"); return; }
    if (!currentLimit.is_enabled) { toast.error("Withdrawals disabled for this pair"); return; }
    if (!isFinite(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (belowMin) { toast.error(`Minimum ${currentLimit.min_amount} ${token}`); return; }
    if (net <= 0) { toast.error("Amount must exceed network fee"); return; }
    setStep("review");
  };

  const handleSubmit = async () => {
    try {
      const res = await request.mutateAsync({
        token_symbol: token, chain, amount: amt, to_address: address.trim(),
      });
      setRequestId(res.request_id);
      setDevCode(res.dev_code ?? null);
      setExpiresAt(new Date(res.expires_at).getTime());
      setStep("confirm");
    } catch {/* toast handled */}
  };

  const handleConfirm = async () => {
    if (!requestId) return;
    if (!/^\d{6}$/.test(code)) { toast.error("Enter the 6-digit code"); return; }
    try {
      await confirm.mutateAsync({ request_id: requestId, code });
      setStep("done");
    } catch {/* toast handled */}
  };

  const secondsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "form" && "Withdraw funds"}
            {step === "review" && "Review withdrawal"}
            {step === "confirm" && "Confirm withdrawal"}
            {step === "done" && "Submitted"}
          </DialogTitle>
          <DialogDescription>
            {step === "form" && "Send tokens to an external wallet."}
            {step === "review" && "Verify details — this cannot be undone."}
            {step === "confirm" && "Enter the 6-digit code to authorize."}
            {step === "done" && "Awaiting admin review and on-chain broadcast."}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator step={step} />

        {step === "form" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Token</Label>
                <Select value={token} onValueChange={(v) => {
                  setToken(v);
                  const first = (limits ?? []).find((l) => l.token_symbol === v && l.is_enabled);
                  if (first) setChain(first.chain);
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tokenOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Network</Label>
                <Select value={chain} onValueChange={(v) => {
                  setChain(v);
                  if (addressError) setAddressError(validateAddress(address, v));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {chainOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Destination address</Label>
              <Input
                value={address}
                onChange={(e) => { setAddress(e.target.value); if (addressError) setAddressError(validateAddress(e.target.value, chain)); }}
                placeholder={chain === "Bitcoin" ? "bc1..." : chain === "Solana" || chain === "Tron" ? "" : "0x..."}
                className={`font-mono text-xs ${addressError ? "border-destructive" : ""}`}
              />
              {addressError && <p className="mt-1 text-xs text-destructive">{addressError}</p>}
            </div>

            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.0001" value={amount} onChange={(e) => setAmount(e.target.value)} className="font-mono" placeholder="0.00" />
              {currentLimit && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Min {currentLimit.min_amount} · Daily cap {currentLimit.daily_limit} {token} · Fee {currentLimit.network_fee} {token}
                </p>
              )}
            </div>

            {amt > 0 && currentLimit && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1 text-xs">
                <Row l="Network fee" v={`${fee} ${token}`} />
                <Row l="You will receive" v={`${net.toFixed(6)} ${token}`} bold />
              </div>
            )}

            <DialogFooter>
              <Button className="w-full gradient-primary" onClick={handleReview}>Continue</Button>
            </DialogFooter>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-3">
            {[
              { l: "Token", v: token },
              { l: "Network", v: chain },
              { l: "Amount", v: `${amt} ${token}` },
              { l: "Network fee", v: `${fee} ${token}` },
              { l: "Receive", v: `${net.toFixed(6)} ${token}`, bold: true },
              { l: "Destination", v: `${address.slice(0, 10)}…${address.slice(-8)}`, mono: true },
            ].map((r) => (
              <div key={r.l} className="flex justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">{r.l}</span>
                <span className={`text-sm ${r.bold ? "font-bold" : "font-semibold"} ${r.mono ? "font-mono" : ""}`}>{r.v}</span>
              </div>
            ))}
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs">
              Verify the destination address. Withdrawals are irreversible after admin approval.
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
              <Button className="gradient-primary" onClick={handleSubmit} disabled={request.isPending}>
                {request.isPending ? "Submitting…" : "Submit request"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs">
              A 6-digit confirmation code was generated. Enter it below to authorize.
              {devCode && (
                <div className="mt-2 font-mono text-lg tracking-widest text-center py-2 bg-background/60 rounded">
                  {devCode}
                  <div className="text-[10px] text-muted-foreground font-sans tracking-normal mt-1">
                    Dev mode — production sends this via email
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Confirmation code</Label>
              <Input
                inputMode="numeric" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="font-mono text-2xl tracking-[0.5em] text-center h-14"
                placeholder="000000"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Expires in {mm}:{ss}</span>
                <Progress value={(secondsLeft / 600) * 100} className="w-24 h-1" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("review")}>Back</Button>
              <Button className="gradient-primary" onClick={handleConfirm} disabled={confirm.isPending || secondsLeft === 0}>
                {confirm.isPending ? "Verifying…" : "Confirm withdrawal"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-3 text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl">✓</div>
            <div className="text-lg font-semibold">Withdrawal submitted</div>
            <p className="text-sm text-muted-foreground">
              Your request is queued for admin review. Track its progress in the Withdrawal History panel on your wallet page.
            </p>
            <Button className="w-full gradient-primary" onClick={() => handleClose(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ l, v, bold }: { l: string; v: string; bold?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{l}</span>
    <span className={bold ? "font-bold" : "font-semibold"}>{v}</span>
  </div>
);

const StepIndicator = ({ step }: { step: Step }) => {
  const steps: Step[] = ["form", "review", "confirm", "done"];
  const i = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1 mb-2">
      {steps.map((s, idx) => (
        <div key={s} className={`flex-1 h-1 rounded-full ${idx <= i ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
};
