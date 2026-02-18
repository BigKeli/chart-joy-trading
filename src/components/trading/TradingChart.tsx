import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import { Candle } from "@/hooks/useMockTradingData";
import { TimeframeSelector } from "./TimeframeSelector";

interface TradingChartProps {
  candles: Candle[];
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  currentPrice: number;
}

export function TradingChart({ candles, selectedTimeframe, onTimeframeChange, currentPrice }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [chartType, setChartType] = useState<"candle" | "line">("candle");

  // Chart colors
  const UP_COLOR = "hsl(152, 69%, 45%)";
  const DOWN_COLOR = "hsl(356, 72%, 55%)";
  const BG_COLOR = "hsl(220, 20%, 6%)";
  const GRID_COLOR = "hsl(220, 15%, 12%)";
  const TEXT_COLOR = "hsl(215, 15%, 55%)";
  const BORDER_COLOR = "hsl(220, 15%, 14%)";

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: BG_COLOR },
        textColor: TEXT_COLOR,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: GRID_COLOR },
        horzLines: { color: GRID_COLOR },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: "hsl(215, 15%, 40%)",
          style: 2,
        },
        horzLine: {
          width: 1,
          color: "hsl(215, 15%, 40%)",
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
        textColor: TEXT_COLOR,
      },
      timeScale: {
        borderColor: BORDER_COLOR,
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderUpColor: UP_COLOR,
      borderDownColor: DOWN_COLOR,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
    });
    candleSeriesRef.current = candleSeries;

    // Line series (hidden by default)
    const lineSeries = chart.addLineSeries({
      color: "hsl(217, 91%, 60%)",
      lineWidth: 2,
      crosshairMarkerVisible: true,
      visible: false,
    });
    lineSeriesRef.current = lineSeries;

    // Volume histogram
    const volumeSeries = chart.addHistogramSeries({
      color: UP_COLOR,
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!candleSeriesRef.current || !lineSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const lineData: LineData[] = candles.map((c) => ({
      time: c.time as any,
      value: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? "hsl(152, 69%, 45%, 0.6)" : "hsl(356, 72%, 55%, 0.6)",
    }));

    try {
      candleSeriesRef.current.setData(candleData);
      lineSeriesRef.current.setData(lineData);
      volumeSeriesRef.current.setData(volumeData);

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (e) {
      // ignore stale data errors
    }
  }, [candles]);

  // Toggle chart type
  useEffect(() => {
    if (!candleSeriesRef.current || !lineSeriesRef.current) return;
    candleSeriesRef.current.applyOptions({ visible: chartType === "candle" });
    lineSeriesRef.current.applyOptions({ visible: chartType === "line" });
  }, [chartType]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TimeframeSelector
        selected={selectedTimeframe}
        onChange={onTimeframeChange}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}
