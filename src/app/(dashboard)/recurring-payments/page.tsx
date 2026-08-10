'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, ArrowRight, Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { parseApiErrorPayload, withReference } from '@/lib/user-facing-errors';

export default function RecurringPaymentsPage() {
  const { address, isConnected } = useAccount();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    token: 'USDC',
    recipientAddress: '',
    frequency: 'monthly',
    endsAt: '',
  });

  const fetchSchedules = async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/schedules', {
        credentials: 'same-origin',
        headers: {
          'x-wallet-address': address,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      } else {
        const payload = await res.json().catch(() => null);
        const parsed = parseApiErrorPayload(payload);
        toast.error(withReference(parsed.message, parsed.requestId));
      }
    } catch (error) {
      console.error('Failed to fetch schedules', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error('Please connect your wallet before creating a schedule.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Recurring payment created successfully! (SCA Provisioned)');
        setIsModalOpen(false);
        setFormData({ amount: '', token: 'USDC', recipientAddress: '', frequency: 'monthly', endsAt: '' });
        fetchSchedules();
      } else {
        const payload = await res.json().catch(() => null);
        const parsed = parseApiErrorPayload(payload);
        toast.error(withReference(parsed.message, parsed.requestId));
      }
    } catch {
      toast.error('We could not create your recurring payment right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-lg text-3xl sm:text-4xl text-on-surface font-bold tracking-tight">
            Recurring Payments
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2 max-w-2xl">
            Automate your crypto investments and bills. Powered by Circle Smart Contract Accounts for secure, gasless execution.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-all duration-300 bg-primary rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          <Plus size={20} className="transition-transform group-hover:rotate-90" />
          New Schedule
        </button>
      </div>

      {/* Stats/Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-6 ambient-shadow">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Clock size={24} />
            <h3 className="font-semibold">Active Schedules</h3>
          </div>
          <p className="text-3xl font-bold">{schedules.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 ambient-shadow">
          <div className="flex items-center gap-3 text-primary mb-2">
            <CheckCircle2 size={24} />
            <h3 className="font-semibold">Total Executed</h3>
          </div>
          <p className="text-3xl font-bold">{schedules.reduce((acc, s) => acc + (s.executionCount || 0), 0)}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 ambient-shadow bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Wallet size={24} />
            <h3 className="font-semibold">Smart Wallets</h3>
          </div>
          <p className="text-sm text-on-surface-variant">Each schedule deploys a secure, non-custodial SCA on Arc Testnet.</p>
        </div>
      </div>

      {/* Schedules List */}
      <div className="glass-panel rounded-3xl overflow-hidden ambient-shadow border border-outline/30">
        <div className="p-6 border-b border-outline/20 bg-surface/50">
          <h2 className="text-xl font-bold text-on-surface">Your Schedules</h2>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center text-primary">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 text-outline">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2">No schedules yet</h3>
              <p className="text-on-surface-variant max-w-sm mb-6">Create your first automated payment schedule to let your Smart Wallet handle the rest.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-primary font-medium hover:underline flex items-center gap-1"
              >
                Create one now <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-outline/10">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-6 hover:bg-surface/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-on-surface flex items-center gap-2">
                        {schedule.amount} {schedule.tokenId}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                          {schedule.status}
                        </span>
                      </h4>
                      <p className="text-sm text-on-surface-variant font-mono mt-1">
                        To: {schedule.destinationAddress.slice(0,6)}...{schedule.destinationAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-on-surface-variant bg-surface-container/50 p-3 rounded-xl w-full sm:w-auto overflow-x-auto">
                    <div className="shrink-0">
                      <p className="text-xs text-outline mb-0.5 uppercase tracking-wider font-semibold">Frequency</p>
                      <p className="font-medium text-on-surface">{schedule.cronExpression === '0 0 * * *' ? 'Daily' : schedule.cronExpression === '0 0 * * 1' ? 'Weekly' : 'Monthly'}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-outline/20 shrink-0"></div>
                    <div className="shrink-0">
                      <p className="text-xs text-outline mb-0.5 uppercase tracking-wider font-semibold">Next Run</p>
                      <p className="font-medium text-on-surface">
                        {new Date(schedule.nextExecutionTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="h-8 w-[1px] bg-outline/20 shrink-0"></div>
                    <div className="shrink-0">
                      <p className="text-xs text-outline mb-0.5 uppercase tracking-wider font-semibold">Expires</p>
                      <p className="font-medium text-on-surface">
                        {schedule.endsAt ? new Date(schedule.endsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                      </p>
                    </div>
                    <div className="h-8 w-[1px] bg-outline/20 shrink-0"></div>
                    <div className="shrink-0">
                      <p className="text-xs text-outline mb-0.5 uppercase tracking-wider font-semibold">Created</p>
                      <p className="font-medium text-on-surface">
                        {new Date(schedule.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for New Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel bg-surface w-full max-w-md rounded-3xl p-6 sm:p-8 ambient-shadow shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-10">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold text-on-surface mb-2">New Schedule</h2>
            <p className="text-on-surface-variant text-sm mb-6">A dedicated Smart Wallet will be deployed for this automation.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Amount (USDC)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="e.g. 50.00"
                  className="w-full px-4 py-3 rounded-xl border border-outline/30 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Recipient Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-xl border border-outline/30 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm"
                  value={formData.recipientAddress}
                  onChange={e => setFormData({...formData, recipientAddress: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Frequency</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-outline/30 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value})}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Expiry Date (Optional)</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-outline/30 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                  value={formData.endsAt}
                  onChange={e => setFormData({...formData, endsAt: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Deploying SCA Wallet...</>
                  ) : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
