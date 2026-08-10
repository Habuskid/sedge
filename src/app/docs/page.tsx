export default function DocsPage() {
  return (
    <div className="max-w-3xl font-body-md text-on-surface-variant leading-relaxed">
      
      {/* Header */}
      <div className="mb-16 border-b border-outline-variant/30 pb-8">
        <h1 className="font-display-lg text-4xl text-on-surface font-bold mb-4">Sedge Documentation</h1>
        <p className="text-xl text-on-surface">
          The AI-first financial copilot for Web3 stablecoins.
        </p>
      </div>

      {/* Introduction */}
      <section id="introduction" className="mb-16 scroll-mt-24">
        <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-4">Introduction & Vision</h2>
        <p className="mb-4">
          Sedge was built with a singular vision: to make decentralized finance as intuitive as sending a text message. By leveraging advanced Natural Language Processing (NLP) models, we abstract away the complexities of blockchain interactions without sacrificing the security of self-custody.
        </p>
      </section>

      {/* The Problem */}
      <section id="problem" className="mb-16 scroll-mt-24">
        <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-4">The Problem</h2>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50">
          <p className="mb-4 text-on-surface">
            <strong>Web3 UX is fundamentally broken for the mainstream user.</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Users must manually manage multiple RPC endpoints and Chain IDs.</li>
            <li>Bridging assets between networks involves high risk, extreme friction, and multiple third-party interfaces.</li>
            <li>Executing a simple recurring payment is nearly impossible without deep technical knowledge or locking funds in a smart contract.</li>
            <li>Users are constantly exposed to phishing attacks when manually searching for DEXs or bridge protocols.</li>
          </ul>
        </div>
      </section>

      {/* Core Use Cases */}
      <section id="use-cases" className="mb-16 scroll-mt-24">
        <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-6">Core Use Cases</h2>
        
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-outline-variant">
            <h3 className="font-title-lg text-on-surface font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">public</span>
              Cross-Chain Global Payroll
            </h3>
            <p className="mb-3">Companies and DAOs need to pay contributors globally across multiple networks.</p>
            <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/50">
              <code className="text-sm font-mono-data text-primary">"Bridge 5,000 USDC to my developer on Sepolia, pulling from my Arc Testnet balance."</code>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-outline-variant">
            <h3 className="font-title-lg text-on-surface font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1e293b]">currency_exchange</span>
              One-Click Stablecoin Swaps
            </h3>
            <p className="mb-3">Users frequently need to swap between fiat-pegged stablecoins (e.g., USD to EUR) to hedge against forex volatility.</p>
            <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/50">
              <code className="text-sm font-mono-data text-primary">"Swap all my EURC to USDC at the best market rate."</code>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-outline-variant">
            <h3 className="font-title-lg text-on-surface font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">event_repeat</span>
              Automated Subscriptions
            </h3>
            <p className="mb-3">Managing recurring SaaS payments or allowances is difficult onchain.</p>
            <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/50">
              <code className="text-sm font-mono-data text-primary">"Send 100 USDC to 0x123...abc every month for my server hosting."</code>
            </div>
          </div>
        </div>
      </section>

      {/* AI Intent Engine */}
      <section id="ai-engine" className="mb-16 scroll-mt-24">
        <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-4">AI Intent Engine</h2>
        <p className="mb-6">
          Sedge uses a strictly bounded AI model (Claude Sonnet 5) focused exclusively on financial intent parsing. It cannot be used for casual chat, and it is explicitly immune to prompt injection attacks.
        </p>
        
        <h3 className="font-title-md font-bold mb-3 text-on-surface">Supported Onchain Commands</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="py-3 px-4 font-label-caps text-on-surface-variant">Intent Type</th>
                <th className="py-3 px-4 font-label-caps text-on-surface-variant">Description</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-outline-variant/50">
                <td className="py-3 px-4 font-mono-data text-on-surface">swap</td>
                <td className="py-3 px-4">Same-chain token swap (Arc Testnet optimized).</td>
              </tr>
              <tr className="border-b border-outline-variant/50">
                <td className="py-3 px-4 font-mono-data text-on-surface">bridge</td>
                <td className="py-3 px-4">Cross-chain transfer via Circle's CCTP (Arc Testnet → Ethereum Sepolia, Base Sepolia, or Arbitrum Sepolia; USDC).</td>
              </tr>
              <tr className="border-b border-outline-variant/50">
                <td className="py-3 px-4 font-mono-data text-on-surface">send</td>
                <td className="py-3 px-4">Standard ERC-20 stablecoin transfer to an address.</td>
              </tr>
              <tr className="border-b border-outline-variant/50">
                <td className="py-3 px-4 font-mono-data text-on-surface">balance_check</td>
                <td className="py-3 px-4">Query your current token balance on a specific chain.</td>
              </tr>
              <tr className="border-b border-outline-variant/50">
                <td className="py-3 px-4 font-mono-data text-on-surface">recurring_payment</td>
                <td className="py-3 px-4">Setup an automated time-locked transfer schedule.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Supported Networks */}
      <section id="networks" className="mb-16 scroll-mt-24">
        <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-6">Supported Networks</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
            <div className="bg-surface-container-low p-4 border-b border-outline-variant">
              <h3 className="font-title-md font-bold text-on-surface">Arc Testnet (L1)</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2 text-sm">
                <li><strong>Chain ID:</strong> <code className="font-mono-data">5042002</code></li>
                <li><strong>Tokens:</strong> USDC, EURC</li>
                <li><strong>Role:</strong> Primary execution layer and central gateway for CCTP outbound bridging to supported destination testnets.</li>
              </ul>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden">
            <div className="bg-surface-container-low p-4 border-b border-outline-variant">
              <h3 className="font-title-md font-bold text-on-surface">Ethereum Sepolia</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2 text-sm">
                <li><strong>Chain ID:</strong> <code className="font-mono-data">11155111</code></li>
                <li><strong>Tokens:</strong> USDC</li>
                <li><strong>Role:</strong> One of the supported CCTP destination testnets for Arc-origin transfers (alongside Base Sepolia and Arbitrum Sepolia).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Model */}
      <section id="security" className="mb-16 scroll-mt-24">
        <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-4">Security Model</h2>
        <div className="p-4 border-l-4 border-primary bg-primary-container/10 rounded-r-lg mb-4">
          <p className="text-on-surface">
            <strong>Sedge is strictly non-custodial.</strong> The AI acts only as a translation layer to construct `transaction objects` containing `to`, `data`, and `value` fields.
          </p>
        </div>
        <p>
          These objects are passed directly to your locally injected Web3 provider (e.g., MetaMask). No transaction is ever executed without your explicit cryptographic signature. The AI does not possess private keys, nor can it bypass wallet approvals.
        </p>
      </section>

      {/* Architecture */}
      <section id="architecture" className="mb-16 scroll-mt-24">
        <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">architecture</span>
          System Architecture
        </h2>
        
        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50">
            <h3 className="font-title-lg text-on-surface font-bold mb-2">Circle API Secure Proxy</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              To securely interact with Circle's APIs (CCTP, Programmable Wallets) without exposing API keys to the frontend or triggering CORS issues, Sedge implements a unified edge proxy route at <code className="text-primary font-mono-data">/api/circle-proxy</code>.
            </p>
            <p className="text-sm text-on-surface-variant mb-2"><strong>Allowed Upstream Hosts:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant font-mono-data">
              <li>api.circle.com</li>
              <li>iris-api.circle.com</li>
              <li>iris-api-sandbox.circle.com</li>
            </ul>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50">
            <h3 className="font-title-lg text-on-surface font-bold mb-2">Viem & Wagmi Integration</h3>
            <p className="text-sm text-on-surface-variant">
              The AI Intent Engine generates unsigned `transaction objects`. These are passed back to the frontend where they are executed using `viem` and `wagmi`. Sedge explicitly validates that all intents are targeted only at our whitelisted Chain IDs (5042002 and 11155111) before allowing the user to sign.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
