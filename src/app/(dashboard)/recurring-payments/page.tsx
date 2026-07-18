'use client';

import Link from 'next/link';

export default function RecurringPaymentsPage() {
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
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-outline text-4xl mb-3 block">
                event_repeat
              </span>
              <p className="font-body-md text-on-surface-variant mb-2">No active schedules</p>
              <p className="font-body-sm text-outline">
                Use the Command Center to create your first recurring payment.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Upcoming Payments
              </h3>
            </div>
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-outline text-3xl mb-2 block">
                calendar_today
              </span>
              <p className="font-body-sm text-on-surface-variant">
                No upcoming payments scheduled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
