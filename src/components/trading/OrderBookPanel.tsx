import { useState } from "react";
import { OrderBookEntry } from "@/hooks/useMockTradingData";
import { cn } from "@/lib/utils";

interface OrderBookPanelProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  currentPrice: number;
  onPriceClick: (price: number) => void;
}

export function OrderBookPanel({ bids, asks, currentPrice, onPriceClick }: OrderBookPanelProps) {
  const [aggregated, setAggregated] = useState(false);

  const maxTotal = Math.max(
    ...(bids.length ? [bids[bids.length - 1].total] : [1]),
    ...(asks.length ? [asks[asks.length - 1].total] : [1])
  );

  const displayAsks = asks.slice(0, 14).reverse();
  const displayBids = bids.slice(0, 14);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">Order Book</span>
        <button
          onClick={() => setAggregated(!aggregated)}
          className={cn(
            "text-xs px-2 py-0.5 rounded border transition-colors",
            aggregated
              ? "border-primary text-primary"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          )}
        >
          Agg
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-1 text-xs text-muted-foreground border-b border-border shrink-0">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex flex-col-reverse flex-1 overflow-hidden">
        <div className="overflow-hidden">
          {displayAsks.map((ask, i) => {
            const depthPct = (ask.total / maxTotal) * 100;
            return (
              <div
                key={i}
                onClick={() => onPriceClick(ask.price)}
                className="relative grid grid-cols-3 px-3 py-[2px] cursor-pointer hover:bg-secondary transition-colors group"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 opacity-20"
                  style={{ width: `${depthPct}%`, background: "hsl(356, 72%, 55%)" }}
                />
                <span className="text-sell mono text-xs relative">{ask.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                <span className="text-right text-xs mono text-foreground relative">{ask.amount.toFixed(4)}</span>
                <span className="text-right text-xs mono text-muted-foreground relative">{ask.total.toFixed(4)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spread / Mid price */}
      <div className="flex items-center justify-center gap-3 py-1.5 border-y border-border bg-secondary/40 shrink-0">
        <span className={cn("font-bold text-sm mono", "text-buy")}>
          {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {asks.length > 0 && bids.length > 0 && (
          <span className="text-xs text-muted-foreground mono">
            Spread: {(asks[0].price - bids[0].price).toFixed(2)}
          </span>
        )}
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {displayBids.map((bid, i) => {
          const depthPct = (bid.total / maxTotal) * 100;
          return (
            <div
              key={i}
              onClick={() => onPriceClick(bid.price)}
              className="relative grid grid-cols-3 px-3 py-[2px] cursor-pointer hover:bg-secondary transition-colors"
            >
              <div
                className="absolute right-0 top-0 bottom-0 opacity-20"
                style={{ width: `${depthPct}%`, background: "hsl(152, 69%, 45%)" }}
              />
              <span className="text-buy mono text-xs relative">{bid.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              <span className="text-right text-xs mono text-foreground relative">{bid.amount.toFixed(4)}</span>
              <span className="text-right text-xs mono text-muted-foreground relative">{bid.total.toFixed(4)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
