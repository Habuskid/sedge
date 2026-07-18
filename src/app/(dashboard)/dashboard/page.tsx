'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PortfolioLiveOverview from './PortfolioLiveOverview';
import { getTransactions, type TransactionRecord } from '@/lib/transaction-store';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const [activities, setActivities] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    setActivities(getTransactions().slice(0, 5));
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* Overview Module */}
      <section>
        <PortfolioLiveOverview />
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Swap', icon: 'swap_horiz', href: '/command-center' },
          { label: 'Bridge', icon: 'link', href: '/command-center' },
          { label: 'Send', icon: 'send', href: '/command-center' },
          { label: 'Activity', icon: 'history', href: '/activity' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3 hover:border-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              {action.icon}
            </span>
            <span className="font-body-sm font-medium text-on-surface">{action.label}</span>
          </Link>
        ))}
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
                  <tr key={tx.id} className="hover:bg-surface-bright/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-body-sm font-medium text-on-surface capitalize">
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
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
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
    </div>
  );
}
