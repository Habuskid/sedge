# Sedge - AI Financial Copilot for Stablecoins

Sedge is an AI-powered copilot that lets users execute stablecoin operations with natural language while keeping wallet-level, non-custodial control.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Circle](https://img.shields.io/badge/Circle-App%20Kit%20%2B%20CCTP-3DBF59)
![Arc](https://img.shields.io/badge/Arc-Testnet-8B5CF6)

---

## Features

| Capability | Description | Status |
|---|---|---|
| AI Command Center | Natural-language intent parsing for swap, bridge, send, balance check, recurring schedule | ✅ Live |
| Stablecoin Swaps | USDC ↔ EURC on Arc Testnet | ✅ Live |
| Cross-chain Bridge | USDC bridge from Arc Testnet to Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia (CCTP route) | ✅ Live |
| Token Send | Direct stablecoin transfer to recipient addresses | ✅ Live |
| Recurring Payments | Create scheduled recurring payouts with Circle smart wallet provisioning | ✅ Live |
| Activity Tracking | Receipts, status history, chain-aware transaction records | ✅ Live |
| Safety UX | Friendly error messages with request/reference IDs for supportability | ✅ Live |

---

## Architecture Diagram

```mermaid
flowchart TD
    U[User Wallet] --> CC[Command Center UI]
    CC --> AI[/api/ai/parse-intent]
    AI --> V[Intent Validation]
    V --> EX[Execution Hook]

    EX --> SW[Swap via Circle App Kit]
    EX --> BR[Bridge via CCTP Route]
    EX --> SN[Send Token]
    EX --> RP[Recurring Schedule API]

    SW --> ARC[Arc Testnet]
    SN --> ARC
    BR --> ETH[Ethereum Sepolia]
    BR --> BASE[Base Sepolia]
    BR --> ARB[Arbitrum Sepolia]

    RP --> DB[(Schedules/Tx Store)]
    EX --> LOG[Structured Logs + Ref IDs]
```

---

## Network Topology

| Network | Chain ID | Explorer | Role |
|---|---:|---|---|
| Arc Testnet | `5042002` | [testnet.arcscan.app](https://testnet.arcscan.app) | Source execution hub |
| Ethereum Sepolia | `11155111` | [sepolia.etherscan.io](https://sepolia.etherscan.io) | Bridge destination |
| Base Sepolia | `84532` | [sepolia.basescan.org](https://sepolia.basescan.org) | Bridge destination |
| Arbitrum Sepolia | `421614` | [sepolia.arbiscan.io](https://sepolia.arbiscan.io) | Bridge destination |

---

## Supported Tokens

| Token | Networks | Operations |
|---|---|---|
| USDC | Arc, Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia | Swap, Bridge, Send |
| EURC | Arc Testnet | Swap, Send |

---

## Stack Used (with images)

| Layer | Stack |
|---|---|
| Framework | ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) |
| UI | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss) |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) |
| Wallet/Chain | ![wagmi](https://img.shields.io/badge/wagmi-3.7.4-0EA5E9) ![viem](https://img.shields.io/badge/viem-2.x-111827) |
| Circle | ![App Kit](https://img.shields.io/badge/Circle-App%20Kit-3DBF59) ![CCTP](https://img.shields.io/badge/Circle-CCTP-22C55E) |
| AI | ![Claude Sonnet 5](https://img.shields.io/badge/Claude-Sonnet%205-7C3AED) |
| Data/State | ![React Query](https://img.shields.io/badge/TanStack-React%20Query-FF4154) |
| Persistence | ![Postgres](https://img.shields.io/badge/Postgres-Vercel%20Postgres-4169E1?logo=postgresql) |

---

## Project Structure

```text
src/
  app/
    (dashboard)/
      command-center/
      recurring-payments/
      activity/
    api/
      ai/parse-intent/
      schedules/
      transactions/
      circle-proxy/
  components/
  hooks/
  lib/
  config/
  types/
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Browser wallet (MetaMask/Rabby/OKX)

### Install
```bash
git clone https://github.com/Habuskid/sedge.git
cd sedge
npm install
```

### Run
```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | AI intent parsing key |
| `NEXT_PUBLIC_ARC_RPC_URL` | No | Arc Testnet RPC override |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | No | Ethereum Sepolia RPC override |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` | No | Base Sepolia RPC override |
| `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL` | No | Arbitrum Sepolia RPC override |
| `NEXT_PUBLIC_CIRCLE_KIT_KEY` | No | Circle App Kit key |
| `RATE_LIMIT_MAX_REQUESTS` | No | Parse-intent endpoint rate limit |

---

## Security & Reliability

- Strict intent validation before execution
- Wallet-first, non-custodial signing flow
- Circle host allowlist via secure proxy route
- Structured logs with masked wallet context
- User-safe error responses and request/reference IDs

---

## Roadmap

- [ ] Mainnet deployment

---

## License

MIT
