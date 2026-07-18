'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-display-lg text-display-lg text-on-surface">Settings</h1>
        <p className="font-body-lg text-on-surface-variant">Manage your account preferences and application settings.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-[16px] overflow-hidden shadow-sm p-5">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Preferences Section */}
          <section>
            <h2 className="font-label-lg font-semibold text-on-surface mb-4">Display Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Theme</label>
                <select 
                  value={theme} 
                  onChange={e => setTheme(e.target.value)} 
                  className="w-full max-w-sm bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Default Currency</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)} 
                  className="w-full max-w-sm bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-outline-variant/50" />

          {/* Notifications Section */}
          <section>
            <h2 className="font-label-lg font-semibold text-on-surface mb-4">Notifications</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div>
                <span className="block font-body-md text-on-surface font-medium">Push Notifications</span>
                <span className="block font-body-sm text-on-surface-variant">Receive alerts for completed transactions and AI messages.</span>
              </div>
            </label>
          </section>

          <hr className="border-outline-variant/50" />

          {/* Account Security Section */}
          <section>
            <h2 className="font-label-lg font-semibold text-on-surface mb-4">Account Security</h2>
            <p className="font-body-sm text-on-surface-variant mb-4">
              Your account is secured by your connected wallet. You can revoke this session at any time.
            </p>
            <button type="button" className="bg-error/10 text-error px-4 py-2 rounded-lg font-label-md font-medium hover:bg-error/20 transition-colors">
              Revoke Current Session
            </button>
          </section>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-label-md font-medium hover:bg-primary-hover transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
