

import Link from 'next/link';
import { LaunchAppButton } from '@/components/wallet/LaunchAppButton';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen w-full overflow-auto">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icons/sedge-logo.png" alt="Sedge Logo" className="w-14 h-14 rounded-full object-cover shadow-sm" />
            <span className="font-headline-md font-bold text-on-surface text-xl">Sedge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-body-sm text-on-surface-variant">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="/whitepaper" className="hover:text-primary transition-colors">Whitepaper</Link>
          </div>
          <div className="flex items-center gap-4">
            <LaunchAppButton className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md font-medium transition-colors hidden md:block border border-outline-variant px-4 py-2 rounded-full">
              Launch App
            </LaunchAppButton>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-mesh min-h-[90vh] flex items-center">
          <div className="max-w-6xl mx-auto px-4 md:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Hero Content */}
              <div className="lg:col-span-6 flex flex-col gap-8 z-10 relative">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container border border-outline-variant/30 w-fit backdrop-blur-sm shadow-sm">
                  <img src="/icons/sedge-logo.png" alt="Sedge Logo" className="w-12 h-12 rounded-full object-cover" />
                  <span className="font-label-caps text-on-surface-variant text-sm font-bold tracking-widest">AI-FIRST FINANCIAL COPILOT</span>
                </div>
                <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-on-surface text-balance font-bold leading-tight">
                  The AI Financial Copilot for Stablecoins
                </h1>
                <p className="font-body-lg text-on-surface-variant max-w-xl text-balance text-lg">
                  Manage swaps, cross-chain transfers, payments, recurring transactions, and portfolio insights using natural language instead of complicated blockchain tools.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <LaunchAppButton className="px-6 py-3 bg-primary text-on-primary font-body-md font-medium rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 transition-all">
                    Launch App
                  </LaunchAppButton>
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
                  <div className="w-full md:w-[48%] ai-gradient-border p-5 flex flex-col gap-4 ambient-shadow bg-surface/90 backdrop-blur-xl transform translate-y-4 md:translate-y-0 z-20 rounded-2xl">
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
                  <div className="w-full md:w-[55%] bg-surface rounded-2xl border border-outline-variant p-5 ambient-shadow transform -translate-x-4 md:-translate-x-12 -translate-y-8 md:translate-y-12 z-10">
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
        {/* Features Section */}
        <section id="features" className="py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-4 md:px-12 w-full">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display-md text-3xl md:text-4xl text-on-surface font-bold mb-4">Powerful Features, Zero Complexity</h2>
              <p className="font-body-md text-on-surface-variant text-lg">
                Sedge combines the security of self-custody with the simplicity of natural language.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="relative group p-5 rounded-2xl bg-surface/50 border border-outline-variant/30 backdrop-blur-md hover:bg-surface/80 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col gap-3 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 relative z-10">
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                </div>
                <h3 className="font-title-lg text-on-surface font-bold text-lg relative z-10">AI Intent Engine</h3>
                <p className="font-body-sm text-on-surface-variant leading-relaxed relative z-10">
                  Swap and send using natural language. Our AI securely structures your intent into a valid onchain transaction.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative group p-5 rounded-2xl bg-surface/50 border border-outline-variant/30 backdrop-blur-md hover:bg-surface/80 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col gap-3 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 relative z-10">
                  <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
                </div>
                <h3 className="font-title-lg text-on-surface font-bold text-lg relative z-10">Cross-Chain Bridging</h3>
                <p className="font-body-sm text-on-surface-variant leading-relaxed relative z-10">
                  Seamlessly bridge USDC and EURC between Arc Testnet and Ethereum Sepolia using Circle's Cross-Chain Transfer Protocol (CCTP).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative group p-5 rounded-2xl bg-surface/50 border border-outline-variant/30 backdrop-blur-md hover:bg-surface/80 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col gap-3 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 relative z-10">
                  <span className="material-symbols-outlined text-[20px]">monitoring</span>
                </div>
                <h3 className="font-title-lg text-on-surface font-bold text-lg relative z-10">Market Intelligence</h3>
                <p className="font-body-sm text-on-surface-variant leading-relaxed relative z-10">
                  Stay informed with live gas tracking across networks, real-time stablecoin peg health monitoring, and the latest crypto macro news.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-mesh relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 md:px-12 w-full relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display-md text-3xl md:text-4xl text-on-surface font-bold mb-4">How it Works</h2>
              <p className="font-body-md text-on-surface-variant text-lg">
                Three simple steps to execute complex financial operations.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center max-w-5xl mx-auto">
              
              {/* Step 1 */}
              <div className="flex-1 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold font-display-sm shadow-lg">1</div>
                <h3 className="font-title-md font-bold text-on-surface text-lg">Command the Copilot</h3>
                <p className="font-body-sm text-on-surface-variant">
                  Type your intent in plain English, like <em>"Bridge 100 USDC to Sepolia"</em>.
                </p>
              </div>

              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="h-[2px] w-full bg-outline-variant/50 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-outline-variant/50"></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex-1 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold font-display-sm shadow-lg">2</div>
                <h3 className="font-title-md font-bold text-on-surface text-lg">AI Optimization</h3>
                <p className="font-body-sm text-on-surface-variant">
                  The AI instantly parses your request into a secure, structured JSON transaction payload.
                </p>
              </div>

              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="h-[2px] w-full bg-outline-variant/50 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-outline-variant/50"></div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex-1 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold font-display-sm shadow-lg">3</div>
                <h3 className="font-title-md font-bold text-on-surface text-lg">Secure Execution</h3>
                <p className="font-body-sm text-on-surface-variant">
                  Review the simulated transaction and approve it safely using your Web3 wallet.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
