'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: 'dashboard', label: 'Portfolio' },
    { href: '/command-center', icon: 'smart_toy', label: 'Command Center' },
    { href: '/recurring-payments', icon: 'cached', label: 'Recurring Payments', isSoon: true },
    { href: '/activity', icon: 'history', label: 'Activity' },
    { href: '/market-intelligence', icon: 'monitoring', label: 'Market Intelligence' },
    { href: '/settings', icon: 'settings', label: 'Settings' },
  ];

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
    <>
      <header className="bg-surface/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 right-0 w-full z-40 border-b border-outline-variant dark:border-[#333] shadow-sm flex justify-between items-center h-16 px-margin-desktop md:pl-margin-desktop pl-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-on-surface hover:bg-surface-container-low p-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <img alt="Sedge Brand Logo" className="w-8 h-8 rounded-full object-cover shadow-sm" src="/icons/sedge-logo.png"/>
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
            <div className="absolute -right-2 sm:right-0 mt-2 w-[90vw] sm:w-80 max-w-sm bg-surface-container-lowest dark:bg-[#1E1E1E] border border-outline-variant dark:border-[#333] rounded-xl shadow-lg overflow-hidden z-50 origin-top-right">
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

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative flex flex-col bg-surface dark:bg-black w-64 h-full shadow-2xl animate-in slide-in-from-left z-50 py-stack-lg px-gutter border-r border-outline-variant dark:border-[#333]">
            <div className="flex items-center justify-between mb-section-gap">
              <div className="flex items-center gap-3">
                <img alt="Sedge Brand Logo" className="w-10 h-10 rounded-full object-cover shadow-sm" src="/icons/sedge-logo.png"/>
                <div>
                  <h1 className="font-headline-md text-xl font-bold text-primary dark:text-white">Sedge</h1>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-body-md text-body-md ${isActive ? 'text-primary dark:text-white font-bold bg-surface-container-low dark:bg-[#1E1E1E]' : 'hover:bg-surface-container-low dark:hover:bg-[#1E1E1E] text-on-surface-variant dark:text-gray-300 hover:dark:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`} data-icon={link.icon}>{link.icon}</span>
                      <span>{link.label}</span>
                    </div>
                    {link.isSoon && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-container text-on-primary-container">SOON</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
