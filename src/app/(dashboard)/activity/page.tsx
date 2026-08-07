'use client';

import { useState, useEffect } from 'react';
import { getAllTransactions, type TransactionRecord } from '@/lib/transaction-store';
import { CHAIN_DISPLAY_NAMES } from '@/config/chains';
import { ModernReceiptModal } from '@/components/activity/ModernReceiptModal';

const TYPE_ICONS: Record<string, string> = {
  swap: 'swap_horiz',
  bridge: 'link',
  send: 'send',
};

const TYPE_COLORS: Record<string, string> = {
  swap: 'bg-black text-white dark:bg-white dark:text-black',
  bridge: 'bg-black text-white dark:bg-white dark:text-black',
  send: 'bg-black text-white dark:bg-white dark:text-black',
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'swap' | 'bridge' | 'send'>('all');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    getAllTransactions().then((txs) => {
      setTransactions(txs);
    });
  }, []);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter);

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Activity
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-1">
            Transaction history from your Command Center operations.
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'swap', 'bridge', 'send'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-body-sm capitalize transition-colors border ${
              filter === f
                ? 'bg-primary-container text-white border-primary-container'
                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary-container'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Transactions table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Type
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Description
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Network
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Date
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">
                  Status
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">
                  Tx
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <span className="material-symbols-outlined text-outline text-4xl mb-3 block">
                      history
                    </span>
                    <p className="font-body-md text-on-surface-variant">
                      {transactions.length === 0
                        ? 'No transactions yet. Use the Command Center to execute your first operation.'
                        : 'No transactions match this filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-surface-bright/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${TYPE_COLORS[tx.type] || 'bg-surface-container-low text-outline'}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {TYPE_ICONS[tx.type] || 'receipt_long'}
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm font-medium text-on-surface capitalize group-hover:text-primary transition-colors">
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface">
                      {tx.description}
                    </td>
                    <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant">
                      {CHAIN_DISPLAY_NAMES[tx.chainId] || `Chain ${tx.chainId}`}
                    </td>
                    <td className="py-4 px-6 font-body-sm text-body-sm text-outline">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded font-label-caps text-[10px] uppercase ${
                          tx.status === 'success'
                            ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      {tx.explorerUrl || tx.txHash ? (
                        <a
                          href={tx.explorerUrl || `https://testnet.arcscan.app/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono-data text-mono-data text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {tx.txHash ? truncateHash(tx.txHash) : 'View'}
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                      ) : (
                        <span className="font-mono-data text-mono-data text-outline">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ModernReceiptModal 
        transaction={selectedTx} 
        onClose={() => setSelectedTx(null)} 
      />
    </div>
  );
}
