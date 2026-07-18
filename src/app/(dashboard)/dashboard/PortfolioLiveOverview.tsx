'use client';

import { useAccount, useBalance } from 'wagmi';
import { arcTestnet } from '@/config/chains';
import { formatUnits } from 'viem';

export default function PortfolioLiveOverview() {
  const { address, isConnected } = useAccount();
  const { data: arcBalance, isLoading: arcLoading } = useBalance({
    address,
    chainId: arcTestnet.id,
    query: { enabled: isConnected },
  });

  const formattedBalance = arcBalance
    ? parseFloat(formatUnits(arcBalance.value, arcBalance.decimals)).toFixed(2)
    : '0.00';

  const isOnline = isConnected && !arcLoading;

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
        <div className="glass-card rounded-[16px] p-5 md:col-span-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle at top right, #38BDF8 0%, transparent 70%)" }}></div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Portfolio Value</h3>
              <span className="material-symbols-outlined text-outline text-[20px]" data-icon="account_balance">account_balance</span>
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                ${formattedBalance}
              </h1>
              {isOnline ? (
                <span className="font-mono-data text-mono-data text-emerald-600 flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                  <span className="material-symbols-outlined text-[16px] mr-1" data-icon="check_circle">check_circle</span>
                  Live
                </span>
              ) : (
                <span className="font-mono-data text-mono-data text-rose-600 flex items-center bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                  <span className="material-symbols-outlined text-[16px] mr-1" data-icon="sync_disabled">sync_disabled</span>
                  {arcLoading ? 'Loading...' : 'Offline'}
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-2">
              {isConnected ? 'Arc Testnet (USDC)' : 'Connect wallet to view'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-[16px] p-5 md:col-span-4 flex flex-col items-center justify-center shadow-sm">
          <div className="w-full flex justify-between items-center mb-6">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Asset Allocation</h3>
            <span className="material-symbols-outlined text-outline text-[20px]" data-icon="donut_large">donut_large</span>
          </div>

          <div
            className="relative w-48 h-48 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ease-out"
            style={{
              background: isConnected && arcBalance && arcBalance.value > 0n
                ? "conic-gradient(#38BDF8 0% 100%)"
                : "conic-gradient(#F3F4F6 0% 100%)"
            }}
          >
            <div className="absolute w-32 h-32 bg-white rounded-full flex items-center justify-center flex-col">
              <span className="font-label-caps text-label-caps text-outline">Assets</span>
              <span className="font-headline-md text-headline-md text-on-surface">
                {isConnected && arcBalance && arcBalance.value > 0n ? '1' : '0'}
              </span>
            </div>
          </div>

          {isConnected && arcBalance && arcBalance.value > 0n && (
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary-container"></div>
                  <span className="font-body-sm text-body-sm text-on-surface">USDC</span>
                </div>
                <span className="font-mono-data text-mono-data text-on-surface">100.0%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
