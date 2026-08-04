'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSettings, getCurrencySymbol } from '@/providers/SettingsProvider';

type Schedule = {
  id: string;
  status: string;
  tokenId: string;
  destinationAddress: string;
  amount: string;
  cronExpression: string;
  nextExecutionTime: string;
  executionCount: number;
};

export default function RecurringPaymentsPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currency } = useSettings();
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    fetch('/api/schedules')
      .then((res) => res.json())
      .then((data) => {
        setSchedules(data.schedules || data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch schedules', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Recurring Payments
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-1">
            Manage your automated schedules and recurring obligations.
          </p>
        </div>
        <Link
          href="/command-center"
          className="bg-primary-container text-white px-6 py-3 rounded-lg font-body-md font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined">add</span>
          Create New Schedule
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Automation Builder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm ai-gradient-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-[120px] text-primary">smart_toy</span>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
                <h3 className="font-body-lg font-semibold text-on-surface">AI Automation Builder</h3>
              </div>
              <p className="font-body-sm text-on-surface-variant mb-4">
                Describe your recurring payment in the Command Center using natural language.
              </p>
              <Link
                href="/command-center"
                className="w-full bg-surface-bright border border-outline-variant rounded-lg p-4 text-on-surface-variant font-body-md hover:border-primary-container transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                <span>Open Command Center to set up a schedule...</span>
              </Link>
            </div>
          </div>

          {/* Example prompts */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-4">
              Example Commands
            </h3>
            <div className="space-y-3">
              {[
                'Pay 0x1234... 500 USDC every Friday',
                'Send team wallet 2000 USDC on the 1st of each month',
                'Transfer 100 EURC to 0xABCD... daily',
              ].map((example) => (
                <div
                  key={example}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-bright border border-outline-variant/50"
                >
                  <span className="material-symbols-outlined text-outline text-[18px]">
                    format_quote
                  </span>
                  <span className="font-mono-data text-mono-data text-on-surface-variant">
                    {example}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedules list */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Active Schedules
              </h3>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-outline text-4xl mb-3 block animate-spin">
                  sync
                </span>
                <p className="font-body-md text-on-surface-variant">Loading schedules...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-outline text-4xl mb-3 block">
                  event_repeat
                </span>
                <p className="font-body-md text-on-surface-variant mb-2">No active schedules</p>
                <p className="font-body-sm text-outline">
                  Use the Command Center to create your first recurring payment.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 flex items-center justify-between hover:bg-surface-bright/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          {schedule.tokenId === 'USDC' ? 'attach_money' : 'euro'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-body-md font-semibold text-on-surface">
                            {currencySymbol}{schedule.amount} {schedule.tokenId}
                          </span>
                          <span className="font-label-caps px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                            {schedule.status}
                          </span>
                        </div>
                        <p className="font-mono-data text-outline text-[12px] mt-1">
                          To: {schedule.destinationAddress.substring(0, 6)}...{schedule.destinationAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-body-sm text-on-surface-variant font-medium">
                        {schedule.cronExpression === '0 0 * * *' ? 'Daily' : 
                         schedule.cronExpression === '0 0 * * 1' ? 'Weekly' : 
                         schedule.cronExpression === '0 0 1 * *' ? 'Monthly' : schedule.cronExpression}
                      </p>
                      <p className="font-body-sm text-outline text-[12px] mt-1">
                        Next: {new Date(schedule.nextExecutionTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
