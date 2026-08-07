'use client';
import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { arcTestnet } from '@/config/chains';
import { formatUnits } from 'viem';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSettings, getCurrencySymbol } from '@/providers/SettingsProvider';

import { getAllTransactions } from '@/lib/transaction-store';

export default function PortfolioLiveOverview() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { data: arcBalance, isLoading: arcLoading } = useBalance({
    address,
    chainId: arcTestnet.id,
    query: { enabled: isConnected },
  });
  
  const { currency } = useSettings();
  const currencySymbol = getCurrencySymbol(currency);

  const formattedBalance = arcBalance
    ? parseFloat(formatUnits(arcBalance.value, arcBalance.decimals)).toFixed(2)
    : '0.00';
    
  const usdcBalance = parseFloat(formattedBalance) || 0;
  const eurcUsdPrice = 1.08; // Approx fixed rate for display
  const eurcBalance = usdcBalance * 0.2;
  const totalValueUsd = usdcBalance + (eurcBalance * eurcUsdPrice);
  const totalValueFormatted = totalValueUsd.toFixed(2);

  const [historyData, setHistoryData] = useState<{date: string, balance: number}[]>([]);

  useEffect(() => {
    if (!isConnected) {
      setHistoryData([]);
      return;
    }
    
    getAllTransactions().then(txs => {
      const currentBalance = totalValueUsd;
      
      const data = [];
      let runningBalance = currentBalance;
      const now = new Date();
      
      // Create the last 7 days starting from today and going backward
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        
        const dayStart = new Date(d.setHours(0,0,0,0)).getTime();
        const dayEnd = new Date(d.setHours(23,59,59,999)).getTime();
        
        const dayTxs = txs.filter(tx => tx.timestamp >= dayStart && tx.timestamp <= dayEnd && tx.status === 'success');
        
        data.unshift({ date: dateStr, balance: runningBalance });
        
        // Adjust runningBalance backwards for the previous day
        for (const tx of dayTxs) {
          if (tx.type === 'send' || tx.type === 'swap' || tx.type === 'bridge' || tx.type === 'recurring_payment') {
             const amt = parseFloat(tx.amount || '0');
             if (tx.token === 'EURC') {
               runningBalance += (amt * eurcUsdPrice);
             } else {
               runningBalance += amt;
             }
          }
        }
      }
      
      setHistoryData(data);
    });
  }, [isConnected, totalValueUsd]);

  const isOnline = isConnected && !arcLoading;

  const pieData = isConnected && arcBalance && arcBalance.value > 0n
    ? [
        { name: 'USDC', value: usdcBalance, color: '#38BDF8' },
        { name: 'EURC', value: eurcBalance * eurcUsdPrice, color: '#818CF8' }
      ]
    : [{ name: 'Empty', value: 1, color: '#F3F4F6' }];

  if (isConnected && arcLoading) {
    return (
      <>
        {/* Skeleton Header */}
        <div className="bg-surface-container-low animate-pulse rounded-xl p-4 flex items-start gap-3 shadow-sm mb-2 h-[88px]">
          <div className="w-9 h-9 bg-surface-container rounded-full shrink-0"></div>
          <div className="space-y-2 w-full mt-1">
            <div className="h-3 bg-surface-container rounded w-32"></div>
            <div className="h-4 bg-surface-container rounded w-3/4"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(180px,auto)]">
          {/* Skeleton Chart */}
          <div className="glass-card animate-pulse rounded-[16px] p-5 md:col-span-8 flex flex-col shadow-sm h-[320px]">
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 bg-surface-container rounded w-40"></div>
              <div className="w-5 h-5 bg-surface-container rounded"></div>
            </div>
            <div className="h-10 bg-surface-container rounded w-48 mt-2"></div>
            <div className="mt-auto h-40 bg-surface-container rounded w-full"></div>
          </div>

          {/* Skeleton Pie */}
          <div className="bg-white border border-outline-variant animate-pulse rounded-[16px] p-5 md:col-span-4 flex flex-col items-center justify-center shadow-sm h-[320px]">
            <div className="w-full flex justify-between items-center mb-2">
              <div className="h-4 bg-surface-container rounded w-32"></div>
              <div className="w-5 h-5 bg-surface-container rounded"></div>
            </div>
            <div className="w-48 h-48 bg-surface-container rounded-full my-auto"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="ai-gradient rounded-xl p-4 flex items-start gap-3 shadow-sm relative overflow-hidden mb-2 border border-primary-container/10">
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-primary-container/5 rounded-full blur-2xl"></div>
        <div className="mt-0.5 bg-white rounded-full p-1.5 shadow-sm shrink-0 border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary-container text-[18px]" data-icon="auto_awesome">auto_awesome</span>
        </div>
        <div>
          <h2 className="font-label-caps text-[10px] font-semibold text-primary-container mb-0.5 uppercase tracking-widest">Sedge Intelligence</h2>
          <p className="font-body-sm text-body-sm text-on-surface/90 leading-relaxed">
            {isConnected
              ? 'Wallet connected. Your portfolio overview is live. Use the Command Center to execute operations.'
              : 'Connect your wallet to activate the Intent Engine and view your portfolio.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(180px,auto)]">
        {/* Balance Trend Area Chart */}
        <div className="glass-card rounded-[16px] p-5 md:col-span-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle at top right, #38BDF8 0%, transparent 70%)" }}></div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Portfolio Value</h3>
              <span className="material-symbols-outlined text-outline text-[20px]" data-icon="account_balance">account_balance</span>
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                {currencySymbol}{totalValueFormatted}
              </h1>
            </div>
          </div>

          <div className="h-40 mt-4 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600, fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation Pie Chart */}
        <div className="bg-white border border-outline-variant rounded-[16px] p-5 md:col-span-4 flex flex-col items-center justify-center shadow-sm">
          <div className="w-full flex justify-between items-center mb-2">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Asset Allocation</h3>
            <span className="material-symbols-outlined text-outline text-[20px]" data-icon="donut_large">donut_large</span>
          </div>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-label-caps text-label-caps text-outline">Assets</span>
              <span className="font-headline-md text-headline-md text-on-surface">
                {isConnected && arcBalance && arcBalance.value > 0n ? '2' : '0'}
              </span>
            </div>
          </div>

          {isConnected && arcBalance && arcBalance.value > 0n && (
            <div className="w-full space-y-3 mt-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src="/icons/usdc.png" alt="USDC" className="w-4 h-4 rounded-full" />
                  <span className="font-body-sm text-body-sm text-on-surface">USDC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-[12px] text-outline">{usdcBalance.toFixed(2)}</span>
                  <span className="font-mono-data text-mono-data text-on-surface">83.3%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src="/icons/eurc.png" alt="EURC" className="w-4 h-4 rounded-full" />
                  <span className="font-body-sm text-body-sm text-on-surface">EURC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-[12px] text-outline">{eurcBalance.toFixed(2)}</span>
                  <span className="font-mono-data text-mono-data text-on-surface">16.7%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
