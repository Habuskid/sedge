import { defineChain } from 'viem';

/**
 * Arc Testnet chain definition.
 * Chain ID: 5042002
 * Native currency: USDC (18 internal decimals, 6 display decimals)
 * Arc docs canonical config from /integrate/infrastructure/bridges
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ARC_RPC_URL as string],
      webSocket: [
        process.env.NEXT_PUBLIC_ARC_RPC_URL
          ? (process.env.NEXT_PUBLIC_ARC_RPC_URL as string).replace('https://', 'wss://')
          : 'wss://rpc.testnet.arc.network'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
});

/**
 * Supported chain IDs allowlist.
 * Used by the intent parser validator to reject any chain not in this list.
 */
export const SUPPORTED_CHAIN_IDS = [5042002, 11155111, 84532, 421614] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

/**
 * Supported token symbols allowlist.
 * Used by the intent parser validator to reject unrecognized tokens.
 */
export const SUPPORTED_TOKENS = ['USDC', 'EURC'] as const;
export type SupportedToken = (typeof SUPPORTED_TOKENS)[number];

export const TOKEN_ADDRESSES: Record<number, Record<SupportedToken, `0x${string}` | undefined>> = {
  5042002: {
    USDC: undefined, // Native token
    EURC: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  },
};

/**
 * Chain name mapping for App Kit.
 * App Kit uses string identifiers like "Arc_Testnet" and "Ethereum_Sepolia".
 */
export const CHAIN_ID_TO_APP_KIT_NAME: Record<number, string> = {
  5042002: 'Arc_Testnet',
  11155111: 'Ethereum_Sepolia',
  84532: 'Base_Sepolia',
  421614: 'Arbitrum_Sepolia',
};

export const CHAIN_DISPLAY_NAMES: Record<number, string> = {
  5042002: 'Arc Testnet',
  11155111: 'Ethereum Sepolia',
  84532: 'Base Sepolia',
  421614: 'Arbitrum Sepolia',
};

export const CHAIN_EXPLORER_URLS: Record<number, string> = {
  5042002: 'https://testnet.arcscan.app',
  11155111: 'https://sepolia.etherscan.io',
  84532: 'https://sepolia.basescan.org',
  421614: 'https://sepolia.arbiscan.io',
};
