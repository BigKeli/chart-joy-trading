import { useRef, useEffect, useState } from "react";
import { Trade } from "@/hooks/useMockTradingData";
import { cn } from "@/lib/utils";

interface RecentTradesProps {
  trades: Trade[];
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!paused && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [trades, paused]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">Recent Trades</span>
        {paused && (
          <span className="text-xs text-muted-foreground italic">paused</span>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 px-3 py-1 text-xs text-muted-foreground border-b border-border shrink-0">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 px-3 py-[2px] hover:bg-secondary transition-colors"
          >
            <span className={cn("text-xs mono font-medium", trade.side === "buy" ? "text-buy" : "text-sell")}>
              {trade.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-right text-xs mono text-foreground">{trade.size.toFixed(4)}</span>
            <span className="text-right text-xs mono text-muted-foreground">{formatTime(trade.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
