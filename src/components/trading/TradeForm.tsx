import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ChevronDown } from "lucide-react";

interface TradeFormProps {
  currentPrice: number;
  selectedPair: string;
  prefillPrice?: number | null;
}

const BALANCE_USDT = 12543.82;
const BALANCE_BTC = 0.4821;
const FEE_RATE = 0.001;

const PERCENT_OPTIONS = [25, 50, 75, 100];

export function TradeForm({ currentPrice, selectedPair, prefillPrice }: TradeFormProps) {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState(currentPrice.toFixed(2));
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const baseCurrency = selectedPair.split("/")[0];
  const quoteCurrency = selectedPair.split("/")[1];

  useEffect(() => {
    if (prefillPrice) {
      setPrice(prefillPrice.toFixed(2));
    }
  }, [prefillPrice]);

  useEffect(() => {
    setPrice(currentPrice.toFixed(2));
  }, [currentPrice]);

  const effectivePrice = orderType === "market" ? currentPrice : parseFloat(price) || currentPrice;
  const amountNum = parseFloat(amount) || 0;
  const total = amountNum * effectivePrice;
  const fee = total * FEE_RATE;

  const handlePercent = (pct: number) => {
    if (side === "buy") {
      const maxTotal = BALANCE_USDT * (pct / 100);
      const maxAmount = maxTotal / effectivePrice;
      setAmount(maxAmount.toFixed(6));
    } else {
      const maxAmount = BALANCE_BTC * (pct / 100);
      setAmount(maxAmount.toFixed(6));
    }
  };

  const isValid = amountNum > 0 && (side === "buy" ? total <= BALANCE_USDT : amountNum <= BALANCE_BTC);

  const handleSubmit = () => {
    if (!isValid) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setAmount("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-panel relative">
      {/* Order type tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["limit", "market"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={cn(
              "flex-1 py-2 text-xs font-medium capitalize transition-colors",
              orderType === type
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Buy/Sell toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded">
          <button
            onClick={() => setSide("buy")}
            className={cn(
              "py-1.5 text-xs font-semibold rounded transition-colors",
              side === "buy" ? "bg-buy text-buy-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Buy {baseCurrency}
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn(
              "py-1.5 text-xs font-semibold rounded transition-colors",
              side === "sell" ? "bg-sell text-sell-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sell {baseCurrency}
          </button>
        </div>

        {/* Balance */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Available</span>
          <span className="mono text-foreground">
            {side === "buy"
              ? `${BALANCE_USDT.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${quoteCurrency}`
              : `${BALANCE_BTC.toFixed(4)} ${baseCurrency}`}
          </span>
        </div>

        {/* Price field (Limit only) */}
        {orderType === "limit" && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Price ({quoteCurrency})</Label>
            <div className="relative">
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mono text-xs h-8 bg-secondary border-border pr-16"
                type="number"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground mono">
                {quoteCurrency}
              </span>
            </div>
          </div>
        )}

        {/* Amount field */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Amount ({baseCurrency})</Label>
          <div className="relative">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mono text-xs h-8 bg-secondary border-border pr-16"
              type="number"
              step="0.0001"
              placeholder="0.0000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground mono">
              {baseCurrency}
            </span>
          </div>
        </div>

        {/* Percent quick-fill */}
        <div className="grid grid-cols-4 gap-1">
          {PERCENT_OPTIONS.map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercent(pct)}
              className="py-1 text-xs rounded border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Total ({quoteCurrency})</Label>
          <div className="relative">
            <Input
              value={total > 0 ? total.toFixed(2) : ""}
              readOnly
              className="mono text-xs h-8 bg-secondary border-border pr-16 text-muted-foreground"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground mono">
              {quoteCurrency}
            </span>
          </div>
        </div>

        {/* Fee preview */}
        {total > 0 && (
          <div className="flex justify-between text-xs p-2 bg-secondary rounded">
            <span className="text-muted-foreground">Est. Fee (0.1%)</span>
            <span className="mono text-muted-foreground">≈ {fee.toFixed(4)} {quoteCurrency}</span>
          </div>
        )}

        {/* Validation warning */}
        {amountNum > 0 && !isValid && (
          <div className="flex items-center gap-2 text-sell text-xs p-2 bg-sell/10 rounded">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Insufficient balance
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={cn(
            "w-full py-2.5 rounded text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
            side === "buy"
              ? "bg-buy text-buy-foreground hover:opacity-90"
              : "bg-sell text-sell-foreground hover:opacity-90"
          )}
        >
          {side === "buy" ? "Buy" : "Sell"} {baseCurrency}
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-4 w-full max-w-xs space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Confirm Order</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Side</span>
                <span className={cn("font-medium", side === "buy" ? "text-buy" : "text-sell")}>
                  {side.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground capitalize">{orderType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="mono text-foreground">{effectivePrice.toFixed(2)} {quoteCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="mono text-foreground">{amountNum.toFixed(6)} {baseCurrency}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="mono font-medium text-foreground">{total.toFixed(2)} {quoteCurrency}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-2 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={cn(
                  "py-2 rounded text-xs font-semibold transition-colors",
                  side === "buy" ? "bg-buy text-buy-foreground" : "bg-sell text-sell-foreground"
                )}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
