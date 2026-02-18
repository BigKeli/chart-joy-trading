import { OpenOrder } from "@/hooks/useMockTradingData";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

interface OpenOrdersProps {
  orders: OpenOrder[];
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function OpenOrders({ orders: initialOrders }: OpenOrdersProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<"open" | "history">("open");

  const cancelOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-panel">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["open", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-xs font-medium capitalize transition-colors",
              activeTab === tab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "open" ? `Open Orders (${orders.length})` : "Order History"}
          </button>
        ))}
      </div>

      {activeTab === "open" && (
        <>
          {/* Header */}
          <div className="grid px-3 py-1.5 border-b border-border shrink-0" style={{ gridTemplateColumns: "1fr 0.7fr 0.7fr 0.9fr 0.9fr 1fr 0.5fr" }}>
            {["Date", "Pair", "Type", "Side", "Price", "Amount/Filled", ""].map((h) => (
              <span key={h} className="text-xs text-muted-foreground">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No open orders
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="grid px-3 py-2 border-b border-border/50 hover:bg-secondary transition-colors items-center"
                  style={{ gridTemplateColumns: "1fr 0.7fr 0.7fr 0.9fr 0.9fr 1fr 0.5fr" }}
                >
                  <span className="text-xs mono text-muted-foreground">{formatTime(order.time)}</span>
                  <span className="text-xs mono text-foreground">{order.pair}</span>
                  <span className="text-xs capitalize text-foreground">{order.type}</span>
                  <span className={cn("text-xs font-medium capitalize", order.side === "buy" ? "text-buy" : "text-sell")}>
                    {order.side}
                  </span>
                  <span className="text-xs mono text-foreground">{order.price.toLocaleString("en-US")}</span>
                  <div className="flex flex-col">
                    <span className="text-xs mono text-foreground">{order.amount.toFixed(4)}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden max-w-[60px]">
                        <div
                          className={cn("h-full rounded-full", order.side === "buy" ? "bg-buy" : "bg-sell")}
                          style={{ width: `${(order.filled / order.amount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mono">
                        {((order.filled / order.amount) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="p-1 rounded hover:bg-sell/20 hover:text-sell text-muted-foreground transition-colors justify-self-end"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
          No order history
        </div>
      )}
    </div>
  );
}
