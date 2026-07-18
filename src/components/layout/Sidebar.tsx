'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/command-center', icon: 'terminal', label: 'Command Center' },
    { href: '/dashboard', icon: 'pie_chart', label: 'Portfolio' },
    { href: '/activity', icon: 'history', label: 'Activity' },
    { href: '/recurring-payments', icon: 'cached', label: 'Recurring Payments' },
    { href: '/market-intelligence', icon: 'insights', label: 'Market Intelligence' },
    { href: '/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline fixed left-0 top-0 h-screen w-64 flex-col py-stack-lg px-gutter hidden md:flex z-50">
      <div className="flex items-center gap-3 mb-section-gap">
        <img alt="Sedge Brand Logo" className="w-8 h-8 rounded-DEFAULT object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2D2sLa0tJyu9hZGtV5oZhvZmUgcYqkH3I-djhceSdyybf3fZK6Rq2m4aPCo7M_UovmdRI6sclI95y6B1rxqjIah1HadQnpLJX4Bfq0r4c4aFonNAmlEEQcnn6H9Z8IxSV2VoIp2gBls2WPp_uErKqDwClHdobxQ2hzep0pFhBFc3qFrbGUiJjd61QU5SAg4TN_F74bkBZFLzDXvDQGwL07pBvBrSA57eARfcMI-bvbuAzzAHgOq56"/>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Sedge</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant">AI Copilot</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-body-md text-body-md ${isActive ? 'text-primary dark:text-primary-fixed-dim font-bold bg-surface-container-low dark:bg-on-surface-variant' : 'hover:bg-surface-container-low dark:hover:bg-on-surface-variant text-on-surface-variant dark:text-on-secondary-fixed-variant'}`}>
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`} data-icon={link.icon}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
