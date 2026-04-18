import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletActions, validateAddress } from "@/hooks/useWalletActions";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const SUPPORTED_TOKENS = ["VNX", "BNB", "ETH", "USDT", "USDC", "BTC", "SOL", "TRX", "FTM"];
const SUPPORTED_CHAINS = ["BNB Chain", "Ethereum", "Fantom", "Bitcoin", "Solana", "Tron"];

interface BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DepositProps extends BaseProps {
  walletAddress: string;
  walletChain: string;
}

/* ════════════════ DEPOSIT ════════════════ */
export const DepositDialog = ({ open, onOpenChange, walletAddress, walletChain }: DepositProps) => {
  const { deposit } = useWalletActions();
  const [step, setStep] = useState<"address" | "report">("address");
  const [token, setToken] = useState("VNX");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");

  const reset = () => {
    setStep("address");
    setToken("VNX");
    setAmount("");
    setTxHash("");
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!txHash.trim()) {
      toast.error("Enter the transaction hash");
      return;
    }
    try {
      await deposit.mutateAsync({ token_symbol: token, amount: amt, tx_hash: txHash });
      handleClose(false);
    } catch {
      /* handled by mutation */
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit funds</DialogTitle>
          <DialogDescription>
            {step === "address"
              ? `Send funds to your ${walletChain} address. Confirm on the next screen.`
              : "Confirm the deposit details below."}
          </DialogDescription>
        </DialogHeader>

        {step === "address" ? (
          <div className="space-y-4">
            <div className="flex justify-center p-4 rounded-2xl bg-white">
              <QRCodeSVG value={walletAddress || "no-address"} size={180} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Your {walletChain} address</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input readOnly value={walletAddress} className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    toast.success("Address copied");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground">
              Only send supported tokens on {walletChain}. Sending unsupported assets may result in permanent loss.
            </div>
            <Button className="w-full gradient-primary" onClick={() => setStep("report")}>
              I have sent funds
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.0001" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="font-mono" />
            </div>
            <div>
              <Label>Transaction hash</Label>
              <Input placeholder="0x..." value={txHash} onChange={e => setTxHash(e.target.value)} className="font-mono text-xs" />
              <p className="mt-1 text-xs text-muted-foreground">Paste the on-chain transaction hash for verification.</p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("address")}>Back</Button>
              <Button className="gradient-primary" onClick={handleSubmit} disabled={deposit.isPending}>
                {deposit.isPending ? "Submitting..." : "Confirm deposit"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ════════════════ WITHDRAW ════════════════ */
export const WithdrawDialog = ({ open, onOpenChange }: BaseProps) => {
  const { withdraw } = useWalletActions();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [token, setToken] = useState("VNX");
  const [chain, setChain] = useState("BNB Chain");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  const reset = () => {
    setStep("form");
    setToken("VNX");
    setChain("BNB Chain");
    setAddress("");
    setAmount("");
    setAddressError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleNext = () => {
    const err = validateAddress(address, chain);
    setAddressError(err);
    if (err) return;
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    try {
      await withdraw.mutateAsync({
        token_symbol: token,
        amount: parseFloat(amount),
        to_address: address,
        chain,
      });
      handleClose(false);
    } catch {
      setStep("form");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{step === "form" ? "Withdraw funds" : "Confirm withdrawal"}</DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Send tokens to an external wallet address."
              : "Review carefully — withdrawals cannot be reversed."}
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Token</Label>
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_TOKENS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Network</Label>
                <Select value={chain} onValueChange={(v) => { setChain(v); setAddressError(validateAddress(address, v)); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Destination address</Label>
              <Input
                placeholder="0x..."
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  if (addressError) setAddressError(validateAddress(e.target.value, chain));
                }}
                className={`font-mono text-xs ${addressError ? "border-destructive" : ""}`}
              />
              {addressError && <p className="mt-1 text-xs text-destructive">{addressError}</p>}
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.0001" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="font-mono" />
            </div>
            <DialogFooter>
              <Button className="w-full gradient-primary" onClick={handleNext}>Review withdrawal</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { l: "Token", v: token },
              { l: "Network", v: chain },
              { l: "Amount", v: `${amount} ${token}` },
              { l: "Destination", v: `${address.slice(0, 10)}...${address.slice(-8)}`, mono: true },
            ].map(row => (
              <div key={row.l} className="flex justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">{row.l}</span>
                <span className={`text-sm font-semibold ${row.mono ? "font-mono" : ""}`}>{row.v}</span>
              </div>
            ))}
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs">
              This action is irreversible. Verify the destination address carefully.
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
              <Button className="gradient-primary" onClick={handleConfirm} disabled={withdraw.isPending}>
                {withdraw.isPending ? "Submitting..." : "Confirm withdrawal"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ════════════════ INTERNAL TRANSFER ════════════════ */
export const TransferDialog = ({ open, onOpenChange }: BaseProps) => {
  const { transfer } = useWalletActions();
  const [token, setToken] = useState("VNX");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const reset = () => {
    setToken("VNX");
    setRecipient("");
    setAmount("");
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!recipient.trim()) { toast.error("Enter recipient username/email"); return; }
    if (!isFinite(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      await transfer.mutateAsync({ token_symbol: token, amount: amt, recipient_username: recipient });
      handleClose(false);
    } catch {
      /* handled */
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send to user</DialogTitle>
          <DialogDescription>Instant internal transfer between VyronexVNX users. No network fees.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Recipient (username or email)</Label>
            <Input placeholder="user@example.com" value={recipient} onChange={e => setRecipient(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.0001" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full gradient-primary" onClick={handleSubmit} disabled={transfer.isPending}>
              {transfer.isPending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
