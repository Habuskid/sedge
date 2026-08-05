'use client';

export default function RecurringPaymentsPage() {
  return (
    <div className="max-w-5xl mx-auto w-full h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-primary-container/20 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[48px] text-primary">build</span>
      </div>
      <h1 className="font-display-lg text-4xl text-on-surface font-bold">
        Coming Soon in V2
      </h1>
      <p className="font-body-lg text-on-surface-variant max-w-lg mx-auto">
        We are upgrading our architecture to support <strong>Circle Smart Contract Accounts (Account Abstraction)</strong> and <strong>Paymaster Integration</strong>. 
        <br /><br />
        This will enable truly gasless, secure, and automated recurring payments directly from your smart wallet.
      </p>
    </div>
  );
}
