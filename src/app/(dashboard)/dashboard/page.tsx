'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PortfolioLiveOverview from './PortfolioLiveOverview';
import { getAllTransactions, type TransactionRecord } from '@/lib/transaction-store';
import { ModernReceiptModal } from '@/components/activity/ModernReceiptModal';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const [activities, setActivities] = useState<TransactionRecord[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    getAllTransactions().then(txs => {
      setActivities(txs.slice(0, 5));
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* Overview Module */}
      <section>
        <PortfolioLiveOverview />
      </section>



      {/* Recent Transactions */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Recent Transactions
          </h3>
          <Link
            href="/activity"
            className="font-body-sm text-body-sm text-primary hover:text-primary-container transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Type
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Description
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium">
                  Date
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">
                  Amount
                </th>
                <th className="py-3 px-6 font-label-caps text-label-caps text-outline uppercase tracking-wider font-medium text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant font-body-sm">
                    No recent activity. Use the Command Center to get started.
                  </td>
                </tr>
              ) : (
                activities.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-surface-bright/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 group-hover:text-primary transition-colors">
                      <span className="font-body-sm font-medium text-on-surface capitalize group-hover:text-primary transition-colors">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-body-sm text-on-surface">{tx.description}</td>
                    <td className="py-4 px-6 font-body-sm text-outline">{formatDate(tx.timestamp)}</td>
                    <td className="py-4 px-6 font-mono-data text-mono-data text-on-surface text-right">
                      {tx.amount} {tx.token}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded font-label-caps text-[10px] uppercase ${
                          tx.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 group-hover:bg-rose-100'
                        } transition-colors`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Render the Modal */}
      <ModernReceiptModal 
        transaction={selectedTx} 
        onClose={() => setSelectedTx(null)} 
      />
    </div>
  );
}
