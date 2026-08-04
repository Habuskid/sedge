'use client';

import { useState, useEffect, useRef } from 'react';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { toast } from 'sonner';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(prev => {
            // Check for new unread notifications that we haven't seen yet to trigger a toast
            if (prev.length > 0) {
              const newUnread = data.filter((n: Notification) => !n.isRead && !prev.some(existing => existing.id === n.id));
              newUnread.forEach((n: Notification) => {
                if (n.type === 'success') toast.success(n.title, { description: n.message });
                else if (n.type === 'error') toast.error(n.title, { description: n.message });
                else toast(n.title, { description: n.message });
              });
            }
            return data;
          });
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s for new push notifications
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return (
    <header className="bg-surface/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 right-0 w-full z-40 border-b border-outline-variant dark:border-[#333] shadow-sm flex justify-between items-center h-16 px-margin-desktop md:pl-margin-desktop pl-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="md:hidden">
          <img alt="Sedge Brand Logo" className="w-8 h-8 rounded-DEFAULT object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2D2sLa0tJyu9hZGtV5oZhvZmUgcYqkH3I-djhceSdyybf3fZK6Rq2m4aPCo7M_UovmdRI6sclI95y6B1rxqjIah1HadQnpLJX4Bfq0r4c4aFonNAmlEEQcnn6H9Z8IxSV2VoIp2gBls2WPp_uErKqDwClHdobxQ2hzep0pFhBFc3qFrbGUiJjd61QU5SAg4TN_F74bkBZFLzDXvDQGwL07pBvBrSA57eARfcMI-bvbuAzzAHgOq56"/>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-on-surface-variant dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-[#1E1E1E] relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-error text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest dark:bg-[#1E1E1E] border border-outline-variant dark:border-[#333] rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-outline-variant dark:border-[#333] bg-surface-container-low dark:bg-[#2A2A2A] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-body-sm font-semibold text-on-surface dark:text-gray-100">Notifications</h3>
                  <span className="text-[11px] text-on-surface-variant dark:text-gray-300 bg-surface-container dark:bg-[#333] px-2 py-1 rounded-full">{unreadCount} unread</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[12px] font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant dark:text-gray-400 font-body-sm">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 border-b border-outline-variant/50 dark:border-[#333]/50 cursor-pointer transition-colors ${n.isRead ? 'opacity-60' : 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-body-sm font-semibold ${n.type === 'error' ? 'text-error' : n.type === 'success' ? 'text-primary' : 'text-on-surface dark:text-gray-100'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0"></span>}
                      </div>
                      <p className="font-body-sm text-[12px] text-on-surface-variant dark:text-gray-300 leading-tight mt-1">
                        {n.message}
                      </p>
                      {n.createdAt && (
                        <span className="text-[10px] text-on-surface-variant dark:text-gray-500 mt-2 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
