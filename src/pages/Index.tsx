import { useState } from "react";
import { useMockTradingData } from "@/hooks/useMockTradingData";
import { TopNavigation } from "@/components/trading/TopNavigation";
import { TradingChart } from "@/components/trading/TradingChart";
import { OrderBookPanel } from "@/components/trading/OrderBookPanel";
import { RecentTrades } from "@/components/trading/RecentTrades";
import { TradeForm } from "@/components/trading/TradeForm";
import { OpenOrders } from "@/components/trading/OpenOrders";
import { LayoutGrid, BarChart2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { id: "trade", label: "Trade", icon: LayoutGrid },
  { id: "chart", label: "Chart", icon: BarChart2 },
  { id: "portfolio", label: "Portfolio", icon: Briefcase },
];

export default function Index() {
  const {
    selectedPair,
    setSelectedPair,
    selectedTimeframe,
    setSelectedTimeframe,
    candles,
    orderBook,
    recentTrades,
    openOrders,
    currentPrice,
    priceChange24h,
    volume24h,
    pairs,
  } = useMockTradingData();

  const [prefillPrice, setPrefillPrice] = useState<number | null>(null);
  const [sidebarActive] = useState("trade");
  const [bottomTab, setBottomTab] = useState<"orders" | "trades">("orders");

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-background">
      {/* Top Navigation */}
      <TopNavigation
        selectedPair={selectedPair}
        pairs={pairs}
        onPairChange={setSelectedPair}
        currentPrice={currentPrice}
        priceChange24h={priceChange24h}
        volume24h={volume24h}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (mini icon bar) */}
        <div className="w-10 flex flex-col items-center py-2 gap-1 border-r border-border bg-nav shrink-0">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors",
                sidebarActive === item.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={item.label}
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Center: Chart + Bottom panels */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chart area */}
          <div className="flex-1 overflow-hidden border-b border-border" style={{ minHeight: 0 }}>
            <TradingChart
              candles={candles}
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
              currentPrice={currentPrice}
            />
          </div>

          {/* Bottom panel */}
          <div className="h-44 flex flex-col overflow-hidden border-t border-border bg-panel">
            {/* Bottom tabs */}
            <div className="flex items-center border-b border-border shrink-0">
              {(["orders", "trades"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={cn(
                    "px-4 py-2 text-xs font-medium capitalize transition-colors",
                    bottomTab === tab
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "orders" ? `Open Orders (${openOrders.length})` : "Recent Trades"}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {bottomTab === "orders" ? (
                <OpenOrders orders={openOrders} />
              ) : (
                <RecentTrades trades={recentTrades} />
              )}
            </div>
          </div>
        </div>

        {/* Right panel: OrderBook + TradeForm */}
        <div className="w-[280px] flex flex-col border-l border-border shrink-0 overflow-hidden">
          {/* Order Book (top ~60%) */}
          <div className="flex-1 overflow-hidden border-b border-border" style={{ minHeight: 0 }}>
            <OrderBookPanel
              bids={orderBook.bids}
              asks={orderBook.asks}
              currentPrice={currentPrice}
              onPriceClick={(price) => setPrefillPrice(price)}
            />
          </div>

          {/* Trade Form (bottom ~40%) */}
          <div className="h-[340px] overflow-hidden border-b border-border">
            <TradeForm
              currentPrice={currentPrice}
              selectedPair={selectedPair}
              prefillPrice={prefillPrice}
            />
          </div>

          {/* Recent Trades mini panel */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <RecentTrades trades={recentTrades} />
          </div>
        </div>
      </div>
    </div>
  );
}
