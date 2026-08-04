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
    <aside className="bg-surface dark:bg-black border-r border-outline-variant dark:border-[#333] fixed left-0 top-0 h-screen w-64 flex-col py-stack-lg px-gutter hidden md:flex z-50">
      <div className="flex items-center gap-4 mb-section-gap">
        <img alt="Sedge Brand Logo" className="w-16 h-16 rounded-full object-cover shadow-sm" src="/icons/sedge-logo.png"/>
        <div>
          <h1 className="font-headline-md text-2xl font-bold text-primary dark:text-white">Sedge</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant dark:text-gray-400">AI Copilot</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-body-md text-body-md ${isActive ? 'text-primary dark:text-white font-bold bg-surface-container-low dark:bg-[#1E1E1E]' : 'hover:bg-surface-container-low dark:hover:bg-[#1E1E1E] text-on-surface-variant dark:text-gray-300 hover:dark:text-white'}`}>
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`} data-icon={link.icon}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
