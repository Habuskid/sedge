'use client';

const STABLECOIN_DATA = [
  { symbol: 'USDC', name: 'USD Coin', price: '1.0000', change: '+0.01%', marketCap: '33.2B', issuer: 'Circle' },
  { symbol: 'EURC', name: 'Euro Coin', price: '1.0842', change: '+0.03%', marketCap: '0.12B', issuer: 'Circle' },
  { symbol: 'USDT', name: 'Tether', price: '1.0001', change: '-0.01%', marketCap: '118.4B', issuer: 'Tether' },
  { symbol: 'DAI', name: 'Dai', price: '0.9998', change: '+0.02%', marketCap: '5.3B', issuer: 'MakerDAO' },
];

const NETWORK_STATS = [
  { label: 'Arc Testnet TPS', value: '~4,000', icon: 'speed' },
  { label: 'Avg Block Time', value: '<1s', icon: 'timer' },
  { label: 'CCTP Domains', value: '9+', icon: 'hub' },
  { label: 'Gas Token', value: 'USDC', icon: 'local_gas_station' },
];

export default function MarketIntelligencePage() {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
          Market Intelligence
        </h1>
        <p className="font-body-lg text-on-surface-variant mt-1">
          Stablecoin rates and network metrics.
        </p>
      </div>

      {/* Network stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {NETWORK_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                {stat.icon}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="font-headline-md text-headline-md text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Stablecoin rates */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Stablecoin Reference Rates
          </h3>
          <span className="font-body-sm text-outline">Indicative only</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Asset
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Issuer
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">
                  Price (USD)
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">
                  24h
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {STABLECOIN_DATA.map((coin) => (
                <tr key={coin.symbol} className="hover:bg-surface-bright/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center">
                        <span className="font-mono-data text-mono-data text-primary font-bold text-[11px]">
                          {coin.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <span className="font-body-sm font-medium text-on-surface block">{coin.symbol}</span>
                        <span className="font-body-sm text-outline text-[12px]">{coin.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-body-sm text-on-surface-variant">{coin.issuer}</td>
                  <td className="py-4 px-6 font-mono-data text-mono-data text-on-surface text-right">
                    ${coin.price}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`font-mono-data text-mono-data ${
                        coin.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {coin.change}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono-data text-mono-data text-on-surface-variant text-right">
                    ${coin.marketCap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-surface-bright border border-outline-variant rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-outline text-[20px] mt-0.5">info</span>
        <p className="font-body-sm text-on-surface-variant">
          Market data shown is indicative and for reference only. Actual rates for swaps and bridges are
          determined by App Kit at execution time. Connect a live data feed in Settings for real-time pricing.
        </p>
      </div>
    </div>
  );
}
