import { ChevronDown, Bell, Settings, User, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
  selectedPair: string;
  pairs: string[];
  onPairChange: (pair: string) => void;
  currentPrice: number;
  priceChange24h: { value: number; percent: number };
  volume24h: number;
}

export function TopNavigation({
  selectedPair,
  pairs,
  onPairChange,
  currentPrice,
  priceChange24h,
  volume24h,
}: TopNavigationProps) {
  const isPositive = priceChange24h.percent >= 0;

  return (
    <header className="h-12 flex items-center gap-0 border-b border-border bg-nav shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 border-r border-border h-full min-w-[160px]">
        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm tracking-tight text-foreground">TradeX</span>
      </div>

      {/* Pair Selector */}
      <div className="flex items-center gap-1 px-4 border-r border-border h-full cursor-pointer hover:bg-secondary transition-colors group">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-foreground">{selectedPair}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <span className="text-xs text-muted-foreground">Spot</span>
        </div>
        {/* Dropdown */}
        <div className="absolute top-12 left-40 hidden group-hover:flex flex-col bg-card border border-border rounded shadow-xl z-50 min-w-[140px]">
          {pairs.map((pair) => (
            <button
              key={pair}
              onClick={() => onPairChange(pair)}
              className={cn(
                "px-3 py-2 text-left text-sm hover:bg-secondary transition-colors",
                pair === selectedPair && "text-primary"
              )}
            >
              {pair}
            </button>
          ))}
        </div>
      </div>

      {/* Price Ticker */}
      <div className="flex items-center gap-6 px-4 h-full border-r border-border">
        <div className="flex flex-col">
          <span className={cn("font-bold text-base mono", isPositive ? "text-buy" : "text-sell")}>
            {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-muted-foreground mono">
            ≈ ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">24h Change</span>
          <span className={cn("text-xs font-medium mono flex items-center gap-1", isPositive ? "text-buy" : "text-sell")}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{priceChange24h.percent.toFixed(2)}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">24h High</span>
          <span className="text-xs mono text-foreground">
            {(currentPrice * 1.025).toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">24h Low</span>
          <span className="text-xs mono text-foreground">
            {(currentPrice * 0.975).toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">24h Volume</span>
          <span className="text-xs mono text-foreground">
            {volume24h.toLocaleString("en-US", { maximumFractionDigits: 1 })} BTC
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1 px-4 h-full">
        <button className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-secondary transition-colors ml-1">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm text-foreground">Account</span>
        </button>
      </div>
    </header>
  );
}
