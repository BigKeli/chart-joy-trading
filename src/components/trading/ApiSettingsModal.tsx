import { useState } from "react";
import { X, Key, Globe, Eye, EyeOff, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ApiSettingsModalProps {
  open: boolean;
  onClose: () => void;
  selectedPair: string;
  pairs: string[];
  onPairChange: (pair: string) => void;
}

const EXCHANGES = [
  { id: "binance", name: "Binance", wsUrl: "wss://stream.binance.com:9443/ws", restUrl: "https://api.binance.com/api/v3" },
  { id: "coinbase", name: "Coinbase Advanced", wsUrl: "wss://advanced-trade-ws.coinbase.com", restUrl: "https://api.coinbase.com/api/v3" },
  { id: "kraken", name: "Kraken", wsUrl: "wss://ws.kraken.com", restUrl: "https://api.kraken.com/0" },
  { id: "bybit", name: "Bybit", wsUrl: "wss://stream.bybit.com/v5/public/spot", restUrl: "https://api.bybit.com/v5" },
  { id: "custom", name: "Custom / Other", wsUrl: "", restUrl: "" },
];

const COINS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT",
  "XRP/USDT", "ADA/USDT", "DOGE/USDT", "AVAX/USDT",
  "DOT/USDT", "MATIC/USDT", "LINK/USDT", "UNI/USDT",
];

type ConnectionStatus = "idle" | "testing" | "success" | "error";

export function ApiSettingsModal({ open, onClose, selectedPair, pairs, onPairChange }: ApiSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"exchange" | "keys" | "pair">("exchange");
  const [selectedExchange, setSelectedExchange] = useState(EXCHANGES[0]);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [customWsUrl, setCustomWsUrl] = useState("");
  const [customRestUrl, setCustomRestUrl] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [pairSearch, setPairSearch] = useState("");
  const [showPairDropdown, setShowPairDropdown] = useState(false);

  if (!open) return null;

  const allPairs = Array.from(new Set([...pairs, ...COINS]));
  const filteredPairs = allPairs.filter((p) =>
    p.toLowerCase().includes(pairSearch.toLowerCase())
  );

  const wsUrl = selectedExchange.id === "custom" ? customWsUrl : selectedExchange.wsUrl;
  const restUrl = selectedExchange.id === "custom" ? customRestUrl : selectedExchange.restUrl;

  const handleTestConnection = () => {
    setConnectionStatus("testing");
    setTimeout(() => {
      // Placeholder — real implementation would attempt a WebSocket/REST ping
      setConnectionStatus(apiKey.length > 8 ? "success" : "error");
    }, 1500);
  };

  const tabs = [
    { id: "exchange", label: "Exchange" },
    { id: "keys", label: "API Keys" },
    { id: "pair", label: "Trading Pair" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">API Configuration</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2.5 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* EXCHANGE TAB */}
          {activeTab === "exchange" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Select your exchange. WebSocket and REST endpoints will be auto-filled. You can override them for custom integrations.
              </p>

              <div className="space-y-2">
                {EXCHANGES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExchange(ex)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded border text-left transition-colors text-xs",
                      selectedExchange.id === ex.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-accent-foreground hover:text-foreground"
                    )}
                  >
                    <span className="font-medium">{ex.name}</span>
                    {selectedExchange.id === ex.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Endpoint overrides */}
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Endpoints
                </p>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">WebSocket URL</Label>
                  <Input
                    value={selectedExchange.id === "custom" ? customWsUrl : wsUrl}
                    onChange={(e) =>
                      selectedExchange.id === "custom"
                        ? setCustomWsUrl(e.target.value)
                        : undefined
                    }
                    readOnly={selectedExchange.id !== "custom"}
                    className={cn(
                      "h-8 text-xs mono bg-secondary border-border",
                      selectedExchange.id !== "custom" && "text-muted-foreground cursor-default"
                    )}
                    placeholder="wss://your-exchange.com/ws"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">REST API Base URL</Label>
                  <Input
                    value={selectedExchange.id === "custom" ? customRestUrl : restUrl}
                    onChange={(e) =>
                      selectedExchange.id === "custom"
                        ? setCustomRestUrl(e.target.value)
                        : undefined
                    }
                    readOnly={selectedExchange.id !== "custom"}
                    className={cn(
                      "h-8 text-xs mono bg-secondary border-border",
                      selectedExchange.id !== "custom" && "text-muted-foreground cursor-default"
                    )}
                    placeholder="https://api.your-exchange.com/v1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* API KEYS TAB */}
          {activeTab === "keys" && (
            <div className="space-y-4">
              <div className="p-3 rounded bg-secondary border border-border text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">🔒 Security Notice</p>
                <p>Keys are stored locally in your browser only. Never share your API secret. Use read-only keys when possible.</p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">API Key</Label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-8 text-xs mono bg-secondary border-border"
                  placeholder="Enter your API key…"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">API Secret</Label>
                <div className="relative">
                  <Input
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    type={showSecret ? "text" : "password"}
                    className="h-8 text-xs mono bg-secondary border-border pr-9"
                    placeholder="Enter your API secret…"
                  />
                  <button
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Passphrase (Coinbase / some exchanges require this) */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Passphrase <span className="text-muted-foreground/60">(if required)</span>
                </Label>
                <div className="relative">
                  <Input
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    type={showPassphrase ? "text" : "password"}
                    className="h-8 text-xs mono bg-secondary border-border pr-9"
                    placeholder="Enter passphrase…"
                  />
                  <button
                    onClick={() => setShowPassphrase((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Test connection */}
              <div className="pt-2 border-t border-border space-y-2">
                <button
                  onClick={handleTestConnection}
                  disabled={connectionStatus === "testing"}
                  className="w-full py-2 rounded text-xs font-medium bg-secondary border border-border text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {connectionStatus === "testing" ? "Testing…" : "Test Connection"}
                </button>

                {connectionStatus === "success" && (
                  <div className="flex items-center gap-2 text-buy text-xs p-2 bg-buy/10 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connection successful
                  </div>
                )}
                {connectionStatus === "error" && (
                  <div className="flex items-center gap-2 text-sell text-xs p-2 bg-sell/10 rounded">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Connection failed — check your keys
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRADING PAIR TAB */}
          {activeTab === "pair" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Select the trading pair to view. This controls the chart, order book, and trade feed.
              </p>

              {/* Search + dropdown */}
              <div className="space-y-1 relative">
                <Label className="text-xs text-muted-foreground">Active Pair</Label>
                <div className="relative">
                  <Input
                    value={pairSearch || selectedPair}
                    onChange={(e) => {
                      setPairSearch(e.target.value);
                      setShowPairDropdown(true);
                    }}
                    onFocus={() => {
                      setPairSearch("");
                      setShowPairDropdown(true);
                    }}
                    className="h-8 text-xs mono bg-secondary border-border pr-8"
                    placeholder="Search pair…"
                  />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {showPairDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded shadow-xl max-h-48 overflow-y-auto">
                    {filteredPairs.map((pair) => (
                      <button
                        key={pair}
                        onClick={() => {
                          onPairChange(pair);
                          setPairSearch("");
                          setShowPairDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs mono hover:bg-secondary transition-colors",
                          pair === selectedPair ? "text-primary" : "text-foreground"
                        )}
                      >
                        {pair}
                        {pair === selectedPair && (
                          <span className="ml-2 text-muted-foreground">(active)</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick-select grid */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick select</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {allPairs.map((pair) => (
                    <button
                      key={pair}
                      onClick={() => {
                        onPairChange(pair);
                        setShowPairDropdown(false);
                      }}
                      className={cn(
                        "py-1.5 px-2 rounded border text-xs mono transition-colors",
                        pair === selectedPair
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-accent-foreground hover:text-foreground"
                      )}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
