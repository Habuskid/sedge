import Link from 'next/link';

export default function WhitepaperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen w-full flex flex-col">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-outline-variant/30 bg-surface/80">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface text-[20px]">arrow_back</span>
            </div>
            <span className="font-headline-md font-bold text-on-surface text-lg">Back to Sedge</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md font-medium transition-colors hidden md:block border border-outline-variant px-4 py-2 rounded-full">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* GitBook Style Layout */}
      <div className="flex flex-1 max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-r border-outline-variant/30 py-10 px-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="font-label-caps text-on-surface-variant mb-4 uppercase font-bold tracking-wider">Foundation</div>
          <ul className="space-y-3 font-body-sm text-on-surface-variant">
            <li><a href="#abstract" className="hover:text-primary transition-colors block">1. Abstract</a></li>
            <li><a href="#trilemma" className="hover:text-primary transition-colors block">2. The UX Trilemma</a></li>
          </ul>

          <div className="font-label-caps text-on-surface-variant mt-8 mb-4 uppercase font-bold tracking-wider">Technology</div>
          <ul className="space-y-3 font-body-sm text-on-surface-variant">
            <li><a href="#architecture" className="hover:text-primary transition-colors block">3. System Architecture</a></li>
            <li><a href="#implementations" className="hover:text-primary transition-colors block">4. Real-World Implementations</a></li>
          </ul>

          <div className="font-label-caps text-on-surface-variant mt-8 mb-4 uppercase font-bold tracking-wider">Future</div>
          <ul className="space-y-3 font-body-sm text-on-surface-variant">
            <li><a href="#roadmap" className="hover:text-primary transition-colors block">5. Current Status & Roadmap</a></li>
            <li><a href="#conclusion" className="hover:text-primary transition-colors block">6. Conclusion</a></li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 py-10 px-6 md:px-12 lg:px-20 pb-32">
          {children}
        </main>
      </div>
    </div>
  );
}
