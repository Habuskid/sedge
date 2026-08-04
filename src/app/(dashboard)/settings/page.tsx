'use client';

import { useSettings } from '@/providers/SettingsProvider';
import { useState } from 'react';

export default function SettingsPage() {
  const { currency, setCurrency, notificationsEnabled, setNotificationsEnabled } = useSettings();
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface dark:text-gray-100">Settings</h1>
        <p className="font-body-lg text-on-surface-variant dark:text-gray-400">Manage your account preferences and application settings.</p>
      </div>

      <div className="bg-surface-container-lowest dark:bg-[#1E1E1E] border border-outline-variant dark:border-[#333] rounded-[16px] overflow-hidden shadow-sm p-5 relative">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Preferences Section */}
          <section>
            <h2 className="font-label-lg font-semibold text-on-surface dark:text-gray-100 mb-4">Display Preferences</h2>
            <div className="space-y-4">

              
              <div>
                <label className="block text-sm font-medium text-on-surface dark:text-gray-200 mb-1">Default Currency</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value as any)} 
                  className="w-full max-w-sm bg-surface-container dark:bg-[#2A2A2A] border border-outline-variant dark:border-[#444] rounded-lg px-3 py-2 text-on-surface dark:text-gray-100 font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-outline-variant/50 dark:border-[#333]" />

          {/* Notifications Section */}
          <section>
            <h2 className="font-label-lg font-semibold text-on-surface dark:text-gray-100 mb-4">Notifications</h2>
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={notificationsEnabled} 
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationsEnabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div>
                <span className="block font-body-md text-on-surface dark:text-gray-100 font-medium">Push Notifications</span>
                <span className="block font-body-sm text-on-surface-variant dark:text-gray-400">Receive alerts for completed transactions and AI messages.</span>
              </div>
            </label>
          </section>

          <div className="pt-4 flex justify-between items-center">
            <span className={`font-body-sm text-green-600 dark:text-green-400 font-medium transition-opacity duration-300 ${showSaved ? 'opacity-100' : 'opacity-0'}`}>
              Settings saved successfully!
            </span>
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-label-md font-medium hover:bg-primary-hover transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
