import { cn } from "@/lib/utils";
import { BarChart2, LineChart, Settings2 } from "lucide-react";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];

interface TimeframeSelectorProps {
  selected: string;
  onChange: (tf: string) => void;
  chartType: "candle" | "line";
  onChartTypeChange: (type: "candle" | "line") => void;
}

export function TimeframeSelector({ selected, onChange, chartType, onChartTypeChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-0 px-2 py-1 border-b border-border bg-panel shrink-0 h-9">
      {/* Chart type toggles */}
      <div className="flex items-center gap-0.5 mr-3 border-r border-border pr-3">
        <button
          onClick={() => onChartTypeChange("candle")}
          className={cn(
            "p-1.5 rounded transition-colors",
            chartType === "candle" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          title="Candlestick"
        >
          <BarChart2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChartTypeChange("line")}
          className={cn(
            "p-1.5 rounded transition-colors",
            chartType === "line" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          title="Line"
        >
          <LineChart className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeframe buttons */}
      <div className="flex items-center gap-0.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onChange(tf)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              selected === tf
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Indicators button */}
      <button className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border-l border-border pl-3">
        <Settings2 className="w-3.5 h-3.5" />
        Indicators
      </button>
    </div>
  );
}
