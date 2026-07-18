

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen w-full overflow-auto">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-headline-md font-bold text-on-surface">Sedge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-body-sm text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-on-surface-variant hover:text-on-surface font-label-md font-medium transition-colors hidden md:block">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-mesh min-h-[90vh] flex items-center">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Hero Content */}
              <div className="lg:col-span-6 flex flex-col gap-8 z-10 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 w-fit backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="font-label-caps text-on-surface-variant">AI-FIRST FINANCIAL COPILOT</span>
                </div>
                <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-on-surface text-balance font-bold leading-tight">
                  The AI Financial Copilot for Stablecoins
                </h1>
                <p className="font-body-lg text-on-surface-variant max-w-xl text-balance text-lg">
                  Manage swaps, cross-chain transfers, payments, recurring transactions, and portfolio insights using natural language instead of complicated blockchain tools.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link href="/dashboard" className="px-6 py-3 bg-primary text-on-primary font-body-md font-medium rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 transition-all">
                    Launch App
                  </Link>
                  <button className="px-6 py-3 bg-surface text-on-surface font-body-md font-medium rounded-lg border border-outline-variant hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 ambient-shadow">
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Watch Demo
                  </button>
                </div>

              </div>

              {/* Hero Visuals */}
              <div className="lg:col-span-6 relative mt-16 lg:mt-0 perspective-[1000px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[500px] max-h-[500px] bg-primary-fixed rounded-full blur-[100px] opacity-30 z-0"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center gap-4 transform-gpu lg:rotate-y-[-5deg] lg:rotate-x-2">
                  
                  {/* Left: AI Chat Interface */}
                  <div className="w-full md:w-1/2 ai-gradient-border p-6 flex flex-col gap-4 ambient-shadow bg-surface/90 backdrop-blur-xl transform translate-y-4 md:translate-y-0 z-20 rounded-2xl">
                    <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                      </div>
                      <div>
                        <div className="font-label-caps text-on-surface">Sedge Copilot</div>
                        <div className="font-body-sm text-[12px] text-primary">Online</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {/* User Message */}
                      <div className="flex gap-3 justify-end">
                        <div className="bg-surface-container-low border border-outline-variant/50 p-3 rounded-2xl rounded-tr-sm max-w-[85%]">
                          <p className="font-body-sm text-on-surface">Swap 500 USDC on Arbitrum to ETH and send it to my cold wallet.</p>
                        </div>
                      </div>
                      {/* AI Processing */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 mt-1 rounded-full bg-surface-container shrink-0 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        </div>
                        <div className="bg-surface-bright border border-outline-variant/30 p-3 rounded-2xl rounded-tl-sm w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Analyzing route...</span>
                          </div>
                          <p className="font-body-sm text-on-surface font-normal leading-relaxed text-sm">
                            I've simulated the transaction. Converting 500 USDC to approx 0.142 ETH on Arbitrum, routing via 1inch for optimal pricing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Transaction Card */}
                  <div className="w-full md:w-[60%] bg-surface rounded-2xl border border-outline-variant p-6 ambient-shadow transform -translate-x-4 md:-translate-x-12 -translate-y-8 md:translate-y-12 z-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-label-caps text-on-surface-variant">TRANSACTION SIMULATION</span>
                      <span className="px-2 py-1 bg-surface-container-highest text-on-surface text-[10px] rounded font-mono-data tracking-wider">EXECUTE</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                          <span className="font-mono-data font-bold text-blue-600 text-sm">$</span>
                        </div>
                        <div>
                          <div className="font-body-md text-on-surface font-medium">USDC</div>
                          <div className="font-body-sm text-on-surface-variant text-sm">Arbitrum</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono-data text-on-surface font-medium">500.00</div>
                        <div className="font-body-sm text-on-surface-variant text-sm">-$500.00</div>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-primary-container text-on-primary font-body-md font-medium rounded-lg shadow-sm hover:bg-surface-tint transition-all mt-4">
                      Approve & Execute
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
