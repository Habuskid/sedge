'use client';
import { useSettings, getCurrencySymbol } from '@/providers/SettingsProvider';
import { useEffect, useState } from 'react';

type MarketData = {
  stablecoins: {
    [key: string]: {
      usd: number;
      eur: number;
      usd_market_cap: number;
      eur_market_cap: number;
      usd_24h_change: number;
      eur_24h_change: number;
    }
  };
  gas: {
    arcTestnet: string;
    sepolia: string;
  };
  news: Array<{
    id: number;
    title: string;
    summary: string;
    source: string;
    time: string;
  }>;
};

// Fallback data in case the API fails
const FALLBACK_DATA = [
  { symbol: 'USDC', name: 'USD Coin', issuer: 'Circle', logo: '/icons/usdc.png' },
  { symbol: 'EURC', name: 'Euro Coin', issuer: 'Circle', logo: '/icons/eurc.png' },
  { symbol: 'USDT', name: 'Tether', issuer: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'DAI', name: 'Dai', issuer: 'MakerDAO', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' },
];

export default function MarketIntelligencePage() {
  const { currency } = useSettings();
  const currencySymbol = getCurrencySymbol(currency);
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/market-data');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatMarketCap = (num: number) => {
    if (!num) return '-';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    return num.toLocaleString();
  };

  const getPegHealth = (price: number, target: number) => {
    if (!price) return { label: 'Unknown', color: 'bg-outline-variant text-outline' };
    const diff = Math.abs(price - target) / target;
    if (diff < 0.002) return { label: 'Optimal', color: 'bg-success/10 text-success border-success/20' };
    if (diff < 0.01) return { label: 'Warning', color: 'bg-warning/10 text-warning border-warning/20' };
    return { label: 'Critical', color: 'bg-error/10 text-error border-error/20' };
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
          Market Intelligence
        </h1>
        <p className="font-body-lg text-on-surface-variant mt-1">
          Real-time stablecoin analytics and macro network metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stablecoin rates */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                Stablecoin Reference Rates
              </h3>
              {loading && <span className="font-body-sm text-outline animate-pulse">Live Updating...</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[540px]">
                <thead>
                  <tr className="bg-surface-bright border-b border-outline-variant">
                    <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">Asset</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">Price ({currency})</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-center">Peg Health</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">24h</th>
                    <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">Market Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {FALLBACK_DATA.map((coin) => {
                    const coinData = data?.stablecoins?.[coin.symbol];
                    const price = coinData ? (currency === 'USD' ? coinData.usd : coinData.eur) : null;
                    const change = coinData ? (currency === 'USD' ? coinData.usd_24h_change : coinData.eur_24h_change) : null;
                    const mcap = coinData ? (currency === 'USD' ? coinData.usd_market_cap : coinData.eur_market_cap) : null;
                    
                    // Determine peg target (EURC is pegged to EUR, everything else to USD roughly)
                    const isEuroPeg = coin.symbol === 'EURC';
                    const targetPrice = isEuroPeg ? (currency === 'USD' ? 1.08 : 1.0) : (currency === 'USD' ? 1.0 : 0.92); // Approx EUR conversion if looking at USD pegged coins in EUR
                    const health = getPegHealth(price || 0, targetPrice);

                    return (
                      <tr key={coin.symbol} className="hover:bg-surface-bright/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex items-center justify-center relative">
                              <img 
                                src={coin.logo} 
                                alt={coin.symbol} 
                                className="w-full h-full object-cover relative z-10" 
                              />
                            </div>
                            <div>
                              <span className="font-body-sm font-medium text-on-surface block">{coin.symbol}</span>
                              <span className="font-body-sm text-outline text-[12px]">{coin.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono-data text-mono-data text-on-surface text-right">
                          {price ? `${currencySymbol}${price.toFixed(4)}` : '...'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-semibold ${health.color}`}>
                            {health.label}
                          </span>
                        </td>
                        <td className={`py-4 px-4 font-mono-data text-mono-data text-right ${change && change >= 0 ? 'text-success' : 'text-error'}`}>
                          {change !== null ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : '...'}
                        </td>
                        <td className="py-4 px-4 font-mono-data text-mono-data text-on-surface-variant text-right">
                          {mcap ? `${currencySymbol}${formatMarketCap(mcap)}` : '...'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cross-Chain Liquidity & Gas Tracker */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-5">
             <div className="flex justify-between items-center mb-6">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">hub</span>
                Cross-Chain Metrics
              </h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Arc Testnet */}
                <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/50">
                  <div className="flex items-center gap-2 mb-4">
                    <img src="/icons/arc.svg" alt="Arc" className="w-5 h-5 rounded-full overflow-hidden" />
                    <span className="font-body-md font-semibold text-on-surface">Arc Testnet</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-on-surface-variant">Avg Gas Price</span>
                      <span className="font-mono-data text-primary font-medium">{data?.gas ? `${data.gas.arcTestnet} Gwei` : '...'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-on-surface-variant">CCTP Outbound</span>
                      <span className="font-body-sm text-success">Operational</span>
                    </div>
                  </div>
                </div>

                {/* Sepolia */}
                <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                       <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="Ethereum" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-body-md font-semibold text-on-surface">Ethereum Sepolia</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-on-surface-variant">Avg Gas Price</span>
                      <span className="font-mono-data text-primary font-medium">{data?.gas ? `${data.gas.sepolia} Gwei` : '...'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body-sm text-on-surface-variant">CCTP Inbound</span>
                      <span className="font-body-sm text-success">Operational</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
          
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          {/* AI News Feed */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                AI Macro News
              </h3>
            </div>
            
            <div className="space-y-5 flex-1 overflow-y-auto pr-2">
              {!data ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                    <div className="h-3 bg-surface-container rounded w-full"></div>
                    <div className="h-3 bg-surface-container rounded w-5/6"></div>
                  </div>
                ))
              ) : (
                data.news.map(item => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body-sm text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-sm">{item.source}</span>
                      <span className="font-body-sm text-[10px] text-outline">{item.time}</span>
                    </div>
                    <h4 className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors leading-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
