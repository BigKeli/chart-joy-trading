import { useState, useEffect, useCallback } from "react";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface Trade {
  id: string;
  price: number;
  size: number;
  side: "buy" | "sell";
  time: number;
}

export interface OpenOrder {
  id: string;
  pair: string;
  type: "limit" | "market";
  side: "buy" | "sell";
  price: number;
  amount: number;
  filled: number;
  time: number;
  status: "open" | "partial";
}

// Generate initial candles
function generateCandles(count: number, basePrice: number, timeframeMs: number): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.012;
    const close = Math.max(price + change, price * 0.9);
    const high = Math.max(open, close) * (1 + Math.random() * 0.006);
    const low = Math.min(open, close) * (1 - Math.random() * 0.006);
    const volume = Math.random() * 500 + 50;

    candles.push({
      time: now - i * Math.floor(timeframeMs / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(4)),
    });

    price = close;
  }
  return candles;
}

function generateOrderBook(midPrice: number): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 20; i++) {
    const bidPrice = midPrice * (1 - (i * 0.0003 + Math.random() * 0.0001));
    const bidAmount = Math.random() * 3 + 0.01;
    bidTotal += bidAmount;
    bids.push({
      price: parseFloat(bidPrice.toFixed(2)),
      amount: parseFloat(bidAmount.toFixed(4)),
      total: parseFloat(bidTotal.toFixed(4)),
    });
  }

  for (let i = 0; i < 20; i++) {
    const askPrice = midPrice * (1 + (i * 0.0003 + Math.random() * 0.0001));
    const askAmount = Math.random() * 3 + 0.01;
    askTotal += askAmount;
    asks.push({
      price: parseFloat(askPrice.toFixed(2)),
      amount: parseFloat(askAmount.toFixed(4)),
      total: parseFloat(askTotal.toFixed(4)),
    });
  }

  return { bids, asks };
}

const TIMEFRAME_MS: Record<string, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
  "1h": 3_600_000,
  "4h": 14_400_000,
  "1D": 86_400_000,
};

const PAIRS: Record<string, number> = {
  "BTC/USDT": 67420.5,
  "ETH/USDT": 3542.8,
  "SOL/USDT": 182.4,
  "BNB/USDT": 612.3,
};

export function useMockTradingData() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({
    bids: [],
    asks: [],
  });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [openOrders] = useState<OpenOrder[]>([
    {
      id: "ord-001",
      pair: "BTC/USDT",
      type: "limit",
      side: "buy",
      price: 65000,
      amount: 0.05,
      filled: 0,
      time: Date.now() - 120000,
      status: "open",
    },
    {
      id: "ord-002",
      pair: "BTC/USDT",
      type: "limit",
      side: "sell",
      price: 70000,
      amount: 0.1,
      filled: 0.04,
      time: Date.now() - 300000,
      status: "partial",
    },
  ]);
  const [currentPrice, setCurrentPrice] = useState(PAIRS[selectedPair]);
  const [priceChange24h] = useState({ value: 1243.5, percent: 1.88 });
  const [volume24h] = useState(28543.2);

  // Generate initial data
  useEffect(() => {
    const basePrice = PAIRS[selectedPair] || 67420;
    const tfMs = TIMEFRAME_MS[selectedTimeframe] || 3_600_000;
    const initialCandles = generateCandles(200, basePrice, tfMs);
    setCandles(initialCandles);
    setCurrentPrice(initialCandles[initialCandles.length - 1].close);
    setOrderBook(generateOrderBook(initialCandles[initialCandles.length - 1].close));

    // Generate initial trades
    const trades: Trade[] = [];
    let tradePrice = basePrice;
    for (let i = 0; i < 50; i++) {
      tradePrice *= 1 + (Math.random() - 0.5) * 0.001;
      trades.unshift({
        id: `t-${i}`,
        price: parseFloat(tradePrice.toFixed(2)),
        size: parseFloat((Math.random() * 0.5 + 0.001).toFixed(4)),
        side: Math.random() > 0.5 ? "buy" : "sell",
        time: Date.now() - i * 3000,
      });
    }
    setRecentTrades(trades);
  }, [selectedPair, selectedTimeframe]);

  // Simulate live tick updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const newPrice = prev * (1 + (Math.random() - 0.495) * 0.001);
        const rounded = parseFloat(newPrice.toFixed(2));

        // Update last candle
        setCandles((prevCandles) => {
          if (prevCandles.length === 0) return prevCandles;
          const updated = [...prevCandles];
          const last = { ...updated[updated.length - 1] };
          last.close = rounded;
          last.high = Math.max(last.high, rounded);
          last.low = Math.min(last.low, rounded);
          last.volume = parseFloat((last.volume + Math.random() * 0.1).toFixed(4));
          updated[updated.length - 1] = last;
          return updated;
        });

        // Update order book
        setOrderBook(generateOrderBook(rounded));

        // Add new trade
        setRecentTrades((prev) => {
          const newTrade: Trade = {
            id: `t-${Date.now()}`,
            price: rounded,
            size: parseFloat((Math.random() * 0.3 + 0.001).toFixed(4)),
            side: Math.random() > 0.5 ? "buy" : "sell",
            time: Date.now(),
          };
          return [newTrade, ...prev.slice(0, 49)];
        });

        return rounded;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const pairs = Object.keys(PAIRS);

  return {
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
  };
}
