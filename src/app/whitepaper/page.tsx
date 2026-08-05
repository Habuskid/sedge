export default function WhitepaperPage() {
  return (
    <div className="max-w-[800px] font-body-md text-on-surface-variant leading-relaxed">
      
      {/* Title Section */}
      <header className="mb-16 border-b border-outline-variant/30 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary border border-primary/20 text-xs font-label-caps tracking-widest mb-6">
          Official Whitepaper
        </div>
        <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface font-bold mb-6 leading-tight">
          Sedge Protocol: An AI-Driven Liquidity & Intent Gateway
        </h1>
        <p className="text-xl text-on-surface-variant max-w-[600px]">
          Abstracting Web3 friction through natural language intent parsing and unified cross-chain liquidity.
        </p>
        <div className="mt-8 text-sm text-on-surface-variant font-mono-data">
          Version 1.0.0 | August 2026
        </div>
      </header>

      <article className="prose prose-invert prose-slate max-w-none prose-headings:text-on-surface prose-p:text-on-surface-variant prose-a:text-primary prose-strong:text-on-surface">
        
        <section id="abstract" className="scroll-mt-24 mb-16">
          <h2 className="font-display-sm text-3xl font-bold mb-6">1. Abstract</h2>
          <p className="leading-relaxed mb-6">
            The mainstream adoption of decentralized finance (DeFi) is severely bottlenecked by a fragmented user experience. Users are forced to manage disparate RPC endpoints, navigate complex bridge contracts, and manually construct transaction payloads. Sedge proposes a paradigm shift: an AI-driven Intent Engine that acts as a secure translation layer between natural language and on-chain execution. By leveraging the Arc Network as a central Gateway for Circle's Cross-Chain Transfer Protocol (CCTP), Sedge enables seamless, chain-abstracted liquidity management without compromising the non-custodial ethos of Web3.
          </p>
        </section>

        <section id="trilemma" className="scroll-mt-24 mb-16">
          <h2 className="font-display-sm text-3xl font-bold mb-6">2. The UX Trilemma</h2>
          <p className="leading-relaxed mb-4">
            Current Web3 interfaces force users into a "UX Trilemma", where they must choose between:
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li><strong>Security:</strong> Trusting centralized custodians to handle bridging and execution.</li>
            <li><strong>Usability:</strong> Navigating multiple fragmented dApps for a single cross-chain swap.</li>
            <li><strong>Cost:</strong> Paying exorbitant fees to aggregators to handle routing.</li>
          </ul>
          <p className="leading-relaxed mb-6">
            Sedge resolves this by abstracting the transaction construction process entirely, allowing users to express financial intent (e.g., "Bridge 500 USDC to Sepolia") while the protocol securely handles the underlying contract interactions via `viem` and `wagmi`.
          </p>
        </section>

        <section id="architecture" className="scroll-mt-24 mb-16">
          <h2 className="font-display-sm text-3xl font-bold mb-6">3. System Architecture</h2>
          
          <h3 className="text-xl font-bold mt-8 mb-4">3.1 Arc Network as the CCTP Gateway</h3>
          <p className="leading-relaxed mb-6">
            Sedge natively integrates the Arc Testnet (Chain ID: <code className="font-mono-data bg-surface-container px-1 py-0.5 rounded">5042002</code>) as its primary execution layer. More importantly, Arc acts as the central interoperability hub. Sedge utilizes Arc's native Gateway contracts in conjunction with Circle's CCTP to enable unified, chain-abstracted USDC balances. Ethereum Sepolia (Chain ID: <code className="font-mono-data bg-surface-container px-1 py-0.5 rounded">11155111</code>) serves as a connected remote network, demonstrating fluid cross-chain liquidity transfers originating from the Arc hub.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">3.2 Edge-Proxied Circle API Integration</h3>
          <p className="leading-relaxed mb-6">
            To securely interact with Circle's infrastructure (Programmable Wallets and CCTP endpoints) without exposing API keys to the client, Sedge implements a unified edge proxy route (`/api/circle-proxy`). This architecture strictly whitelists requests to `api.circle.com` and `iris-api.circle.com`, ensuring secure, CORS-compliant backend communication while keeping the frontend highly performant.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">3.3 The NLP Intent Engine</h3>
          <p className="leading-relaxed mb-6">
            The core of Sedge is a heavily bounded Natural Language Processing engine powered by Claude 3.5 Sonnet. The AI is strictly instructed to operate <em>only</em> as a JSON parser. It maps user inputs to a standardized `transaction object` schema (`to`, `data`, `value`). It is explicitly immune to prompt-injection attacks and cannot be used for casual chat. Most critically, the AI <strong>does not possess private keys</strong>. It merely constructs unsigned payloads that are passed to the user's injected Web3 provider (e.g., MetaMask) for cryptographic signature.
          </p>
        </section>

        <section id="implementations" className="scroll-mt-24 mb-16">
          <h2 className="font-display-sm text-3xl font-bold mb-6">4. Real-World Implementations</h2>
          <p className="leading-relaxed mb-4">
            Sedge's architecture natively supports several critical DeFi primitives directly through natural language:
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li><strong>Cross-Chain Global Payroll:</strong> "Bridge 5,000 USDC to my developer on Sepolia, pulling from my Arc Testnet balance." Sedge automatically constructs the `depositForBurn` CCTP payload.</li>
            <li><strong>Automated Subscriptions:</strong> Users can command Sedge to set up recurring ERC-20 transfers, entirely abstracting the complexity of token approvals and time-locks.</li>
            <li><strong>One-Click Swapping:</strong> Same-chain stablecoin swaps (e.g., USDC to EURC) are executed directly on the Arc Testnet.</li>
          </ul>
        </section>

        <section id="roadmap" className="scroll-mt-24 mb-16">
          <h2 className="font-display-sm text-3xl font-bold mb-6">5. Realistic Protocol Roadmap</h2>
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/50 mt-6">
            <h3 className="text-lg font-bold text-on-surface mb-2">Phase 1: Testnet Architecture Validation (Current)</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-on-surface-variant mb-4">
              <li>Deployment of Sedge Copilot on Arc Testnet.</li>
              <li>Verification of CCTP integration with Ethereum Sepolia.</li>
              <li>Secure deployment of the Circle Edge Proxy.</li>
            </ul>

            <h3 className="text-lg font-bold text-on-surface mb-2">Phase 2: Account Abstraction & Paymaster</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-on-surface-variant mb-4">
              <li><strong>ERC-4337 Migration:</strong> Transition from standard EOA wallets to Circle Programmable Wallets (Smart Contract Accounts).</li>
              <li><strong>Circle Paymaster:</strong> Enabling gasless, automated recurring payments.</li>
              <li>Push notifications for due payments.</li>
            </ul>

            <h3 className="text-lg font-bold text-on-surface mb-2">Phase 3: Mainnet</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-on-surface-variant">
              <li>Mainnet deployment.</li>
            </ul>
          </div>
        </section>

        <section id="conclusion" className="scroll-mt-24 mb-16">
          <h2 className="font-display-sm text-3xl font-bold mb-6">6. Conclusion</h2>
          <p className="leading-relaxed mb-16">
            Sedge represents the natural evolution of Web3 interfaces. By combining the deterministic security of Circle's infrastructure and the Arc Network with the accessibility of modern AI models, Sedge removes the technical barriers to decentralized finance. It transforms the blockchain from a developer-centric database into a fluid, user-centric financial network.
          </p>
        </section>
      </article>

    </div>
  );
}
