# Sedge - AI Financial Copilot for Stablecoins

An AI-powered financial copilot that enables natural language control of stablecoin operations across multiple blockchains. Built on Circle's Web3 infrastructure (App Kit, CCTP) and Arc Network.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Circle](https://img.shields.io/badge/Circle-App%20Kit-3DBF59)
![Arc Network](https://img.shields.io/badge/Arc-Testnet-8B5CF6)

---

## Features

### AI Command Center
- Natural language transaction interface powered by Claude AI
- Intent recognition for swaps, bridges, sends, balance checks, and recurring payments
- Real-time fee estimation before execution
- Approval-based workflow with transaction receipts

### Token Swaps
- Swap between supported stablecoins (USDC, EURC) on Arc Testnet
- Gas estimation and fee previews
- Transaction confirmation with explorer links

### Cross-Chain Bridge (CCTP)
- Bridge USDC between Arc Testnet and Ethereum Sepolia
- Powered by Circle's Cross-Chain Transfer Protocol
- Automatic retry logic for failed bridge attempts

### Token Transfers
- Send tokens to any valid address on supported chains
- Address validation and checksumming
- Transaction history tracking

### Portfolio Dashboard
- Live wallet balance display via on-chain queries
- Asset allocation visualization (donut chart)
- Quick-action cards for common operations
- Recent transaction table with status indicators

### Activity History
- Filterable transaction log (All / Swap / Bridge / Send)
- Transaction receipts with explorer links
- Status tracking (confirmed, pending, failed)

### Market Intelligence
- Stablecoin reference rates (USDC, EURC, USDT, DAI)
- Arc Testnet network statistics (TPS, block time, gas)
- CCTP domain information

### Recurring Payments (UI Ready)
- AI automation builder with example prompts
- Schedule management interface (active, paused, cancelled)
- Natural language schedule creation via Command Center

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐   │
│  │   Next.js    │   │    wagmi +       │   │   Circle App     │   │
│  │   App Router │   │    viem          │   │   Kit            │   │
│  │   (Pages)    │   │   (Wallet Conn)  │   │   (Swap/Bridge)  │   │
│  └──────┬───────┘   └────────┬─────────┘   └────────┬─────────┘   │
│         │                    │                       │             │
│         │         ┌──────────┴───────────────────────┘             │
│         │         │                                                 │
│  ┌──────┴─────────┴──────────────────────────────────────────┐     │
│  │              useIntentExecution Hook                        │     │
│  │  (Translates AI intents → Circle App Kit transactions)     │     │
│  └──────────────────────────┬────────────────────────────────┘     │
│                             │                                       │
├─────────────────────────────┼───────────────────────────────────────┤
│                      SERVER (Next.js API)                            │
├─────────────────────────────┼───────────────────────────────────────┤
│                             │                                       │
│  ┌──────────────────────────┴────────────────────────────────┐     │
│  │              /api/ai/parse-intent                           │     │
│  │  (Claude AI: NL → Structured Intent JSON)                  │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │              /api/circle-proxy                              │     │
│  │  (CORS proxy for Circle API calls)                         │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BLOCKCHAIN LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────┐          ┌────────────────────────┐        │
│  │   Arc Testnet      │◄──CCTP──►│   Ethereum Sepolia     │        │
│  │   (Chain 5042002)  │          │   (Chain 11155111)     │        │
│  │                    │          │                        │        │
│  │   - USDC (native)  │          │   - USDC (ERC-20)      │        │
│  │   - EURC           │          │                        │        │
│  └────────────────────┘          └────────────────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow: AI Command Execution

```
User Input (Natural Language)
       │
       ▼
┌─────────────────┐
│  AI Parser      │  POST /api/ai/parse-intent
│  (Claude AI)    │  Rate limited, validated
└────────┬────────┘
         │ { intent, message, confidence }
         ▼
┌─────────────────┐
│  Intent Card    │  Shows parsed intent for user review
│  (Fee Estimate) │  Displays gas/fee estimation
└────────┬────────┘
         │ User clicks "Approve"
         ▼
┌─────────────────┐
│  App Kit        │  Circle's Web3 execution layer
│  Execute        │  Swap / Bridge / Send
└────────┬────────┘
         │ Transaction hash
         ▼
┌─────────────────┐
│  Confirmation   │  Explorer link + receipt
│  + History      │  Saved to activity log
└─────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Server/client rendering, API routes |
| UI | React 19, Tailwind CSS 4 | Component library, utility styling |
| Design System | Material Design 3 (custom) | 40+ semantic color tokens, typography scale |
| AI | Anthropic Claude (Sonnet) | Natural language intent parsing |
| Web3 SDK | Circle App Kit + Viem Adapter | Token swaps, bridges, transfers |
| Wallet | wagmi + viem | Wallet connection, balance queries |
| Bridge | Circle CCTP | Cross-chain USDC transfers |
| State | TanStack React Query | Async state for wallet operations |
| Fonts | Hanken Grotesk, Inter, Geist | Display, body, monospace |
| Icons | Material Symbols Outlined | UI iconography |

---

## Project Structure

```
sedge/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout (fonts, providers)
│   │   ├── api/
│   │   │   ├── ai/parse-intent/        # AI intent parsing endpoint
│   │   │   └── circle-proxy/           # CORS proxy for Circle APIs
│   │   └── (dashboard)/
│   │       ├── layout.tsx              # Sidebar + Header layout
│   │       ├── dashboard/              # Portfolio overview
│   │       ├── command-center/         # AI chat interface
│   │       ├── recurring-payments/     # Schedule management
│   │       ├── activity/               # Transaction history
│   │       ├── market-intelligence/    # Market data
│   │       └── settings/              # User preferences
│   ├── components/
│   │   ├── layout/                     # Sidebar, Header
│   │   ├── wallet/                     # ConnectWalletButton
│   │   ├── command-center/             # IntentCard
│   │   ├── activity/                   # ReceiptModal
│   │   └── providers/                  # Web3Provider
│   ├── hooks/
│   │   ├── useWalletAdapter.ts         # Circle Viem adapter
│   │   └── useIntentExecution.ts       # Intent → transaction execution
│   ├── lib/
│   │   ├── app-kit.ts                  # Circle App Kit singleton
│   │   ├── circle-fetch-proxy.ts       # Client-side CORS fix
│   │   ├── rate-limit.ts              # IP-based rate limiting
│   │   ├── validation.ts             # Intent validation engine
│   │   └── transaction-store.ts       # LocalStorage tx history
│   ├── config/
│   │   ├── chains.ts                   # Chain definitions + constants
│   │   └── wagmi.ts                   # Wagmi configuration
│   └── types/
│       └── intents.ts                 # TypeScript type definitions
├── .env.example                        # Environment variable template
├── tailwind.config.ts                  # Material Design 3 theme
├── next.config.ts                      # Next.js configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A browser wallet (MetaMask recommended)
- API keys (see Environment Variables)

### Installation

```bash
git clone https://github.com/Habuskid/sedge.git
cd sedge
npm install
```

### Environment Setup

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for AI intent parsing |
| `NEXT_PUBLIC_ARC_RPC_URL` | No | Arc Testnet RPC (default: public endpoint) |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | No | Sepolia RPC (default: public endpoint) |
| `NEXT_PUBLIC_CIRCLE_KIT_KEY` | No | Circle App Kit key (improves rate limits) |
| `RATE_LIMIT_MAX_REQUESTS` | No | AI requests per minute per IP (default: 10) |

---

## Supported Networks

| Network | Chain ID | Explorer |
|---------|----------|----------|
| Arc Testnet | 5042002 | [testnet.arcscan.app](https://testnet.arcscan.app) |
| Ethereum Sepolia | 11155111 | [sepolia.etherscan.io](https://sepolia.etherscan.io) |

## Supported Tokens

| Token | Networks | Operations |
|-------|----------|------------|
| USDC | Arc Testnet, Sepolia | Swap, Bridge, Send |
| EURC | Arc Testnet | Swap, Send |

---

## Security

- All AI-parsed intents are validated against strict allowlists before execution
- Rate limiting on AI endpoints (configurable per-IP limits)
- Address checksumming via viem before any transaction
- Amount bounds validation (prevents overflow/negative amounts)
- CORS proxy restricts requests to Circle API domains only
- No private keys stored server-side for user wallets

---

## Roadmap

- [ ] Automated recurring payments via Circle Developer-Controlled Wallets
- [ ] Push notifications for due payments
- [ ] Multi-signature approval flows
- [ ] Portfolio analytics and reporting
- [ ] Mainnet deployment

---

## License

MIT
