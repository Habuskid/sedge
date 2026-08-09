'use client';

import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useWalletAdapter } from './useWalletAdapter';
import { getAppKit } from '@/lib/app-kit';
import { CHAIN_ID_TO_APP_KIT_NAME, CHAIN_EXPLORER_URLS } from '@/config/chains';
import type {
  ParsedIntent,
  SwapIntent,
  BridgeIntent,
  SendIntent,
  EstimationData,
  ExecutionData,
} from '@/types/intents';

function chainName(id?: number): string {
  return CHAIN_ID_TO_APP_KIT_NAME[id || 5042002] || 'Arc_Testnet';
}

/**
 * Chain metadata for wallet_addEthereumChain.
 * This ensures the wallet knows about destination chains before bridging.
 */
const CHAIN_PARAMS: Record<number, {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}> = {
  84532: {
    chainId: '0x14A34',
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  421614: {
    chainId: '0x66EEE',
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
  },
  11155111: {
    chainId: '0xAA36A7',
    chainName: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  5042002: {
    chainId: '0x4CEF52',
    chainName: 'Arc Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: [process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app'],
  },
};

/**
 * Ensures a chain is added to the user's wallet via wallet_addEthereumChain.
 * If the chain already exists, the wallet silently ignores the request.
 * This prevents the bridge mint step from failing when the destination
 * chain is not yet known to the wallet.
 */
async function ensureChainInWallet(provider: any, chainId: number): Promise<void> {
  const params = CHAIN_PARAMS[chainId];
  if (!params) return;

  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [params],
    });
  } catch (err: any) {
    // Error code 4902 means chain not added — but we just tried to add it, so
    // any other error (like user rejection) we should log but not block on.
    // Some wallets throw if the chain is already added — that's fine.
    console.warn(`ensureChainInWallet(${chainId}): ${err?.message || err}`);
  }
}

function buildSwapParams(intent: SwapIntent, adapter: unknown) {
  return {
    from: { adapter, chain: chainName(intent.chainId) },
    tokenIn: intent.fromToken,
    tokenOut: intent.toToken,
    amountIn: intent.amount,
    config: { allowanceStrategy: 'approve' as const },
  };
}

function buildBridgeParams(intent: BridgeIntent, adapter: unknown) {
  return {
    from: { adapter, chain: chainName(intent.fromChainId) },
    to: { adapter, chain: chainName(intent.toChainId) },
    amount: intent.amount,
  };
}

function buildSendParams(intent: SendIntent, adapter: unknown) {
  return {
    from: { adapter, chain: chainName(intent.chainId) },
    to: intent.recipientAddress,
    amount: intent.amount,
    token: intent.token,
  };
}

export function useIntentExecution() {
  const { adapter, isReady, error: adapterError } = useWalletAdapter();
  const { address, chainId: currentChainId, connector } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const estimateIntent = useCallback(
    async (intent: ParsedIntent): Promise<EstimationData> => {
      if (!adapter) throw new Error('Wallet not connected');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kit = getAppKit() as any;

      switch (intent.type) {
        case 'swap': {
          if (intent.fromToken.toLowerCase() === intent.toToken.toLowerCase()) {
            throw new Error("Cannot swap a token for itself.");
          }
          const params = buildSwapParams(intent, adapter);
          const est = await kit.estimateSwap(params);
          return {
            estimatedOutput: est.estimatedOutput,
            fees: est.fees,
          };
        }
        case 'bridge': {
          if (intent.fromChainId === intent.toChainId) {
            throw new Error("Cannot bridge to the same chain.");
          }
          const params = buildBridgeParams(intent, adapter);
          const est = await kit.estimateBridge(params);
          return { fees: est.fees };
        }
        case 'send': {
          if (address && intent.recipientAddress.toLowerCase() === address.toLowerCase()) {
            throw new Error("Cannot send tokens to your own address.");
          }
          const params = buildSendParams(intent, adapter);
          const est = await kit.estimateSend(params);
          return {
            estimatedGas: typeof est.fee === 'string' ? est.fee : String(est.fee),
            fees: est.fees,
          };
        }
        case 'balance_check':
        case 'recurring_payment':
          return {};
        default:
          return {};
      }
    },
    [adapter],
  );

  const executeIntent = useCallback(
    async (intent: ParsedIntent): Promise<ExecutionData> => {
      if (!adapter) throw new Error('Wallet not connected');
      
      // Get the wallet provider for direct RPC calls
      let provider: any = null;
      if (connector) {
        try {
          provider = await connector.getProvider();
        } catch {
          console.warn('Could not get provider for chain pre-registration');
        }
      }

      if (intent.type !== 'balance_check' && intent.type !== 'recurring_payment') {
        const targetChainId = intent.type === 'bridge' ? intent.fromChainId : ((intent as any).chainId || 5042002);

        // For bridge intents, pre-register BOTH source and destination chains
        // in the wallet so the mint step doesn't fail on unknown chain
        if (intent.type === 'bridge' && provider) {
          console.log('Pre-registering bridge chains in wallet...');
          await ensureChainInWallet(provider, intent.fromChainId);
          await ensureChainInWallet(provider, intent.toChainId);
        }

        if (targetChainId && currentChainId !== targetChainId) {
          try {
            await switchChainAsync({ chainId: targetChainId });
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (err: any) {
            // If switchChain fails, try adding the chain first then switching
            if (provider) {
              try {
                await ensureChainInWallet(provider, targetChainId);
                await switchChainAsync({ chainId: targetChainId });
                await new Promise((resolve) => setTimeout(resolve, 500));
              } catch (retryErr: any) {
                console.error('Failed to add and switch chain:', retryErr);
                throw new Error(`Please switch to ${chainName(targetChainId)} in your wallet to continue.`);
              }
            } else {
              console.error('Failed to switch chain manually:', err);
              throw new Error(`Please switch to ${chainName(targetChainId)} in your wallet to continue.`);
            }
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kit = getAppKit() as any;

      switch (intent.type) {
        case 'swap': {
          if (intent.fromToken.toLowerCase() === intent.toToken.toLowerCase()) {
            throw new Error("Cannot swap a token for itself.");
          }
          const params = buildSwapParams(intent, adapter);
          const result = await kit.swap(params);
          const chainId = intent.chainId || 5042002;
          console.log('Transaction executed:', {
            type: 'swap',
            txHash: result.txHash,
            chainId,
            timestamp: Date.now(),
          });
          return {
            txHash: result.txHash,
            explorerUrl:
              result.explorerUrl ||
              `${CHAIN_EXPLORER_URLS[chainId]}/tx/${result.txHash}`,
          };
        }
        case 'bridge': {
          if (intent.fromChainId === intent.toChainId) {
            throw new Error("Cannot bridge to the same chain.");
          }
          const params = buildBridgeParams(intent, adapter);
          let result = await kit.bridge(params);

          if (result.state === 'error') {
            console.warn('AppKit Bridge Error (First attempt):', result.error);
            // Arc docs: use kit.retry() for failed bridge transfers
            result = await kit.retry(result, {
              from: adapter,
              to: adapter,
            });
          }

          if (result.state === 'error') {
            const errorMsg = result.error?.message || result.error || 'Bridge failed after retry.';
            console.error('AppKit Bridge Error (Final):', result.error);
            console.error('AppKit Bridge Full Result:', JSON.stringify(result, (key, value) => 
              typeof value === 'bigint' ? value.toString() : value
            , 2));
            return { error: `Bridge failed: ${errorMsg}` };
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const steps: any[] = result.steps || [];
          const burnStep = steps.find(
            (s) => s.name === 'burn' && s.state === 'success',
          );
          const successStep = steps.find((s) => s.state === 'success');
          const txHash = burnStep?.txHash || successStep?.txHash;
          const explorerUrl =
            burnStep?.explorerUrl || successStep?.explorerUrl;

          console.log('Transaction executed:', {
            type: 'bridge',
            txHash,
            chainId: intent.fromChainId,
            timestamp: Date.now(),
          });
          return { txHash, explorerUrl };
        }
        case 'send': {
          if (address && intent.recipientAddress.toLowerCase() === address.toLowerCase()) {
            throw new Error("Cannot send tokens to your own address.");
          }
          const params = buildSendParams(intent, adapter);
          const result = await kit.send(params);
          const chainId = intent.chainId || 5042002;
          console.log('Transaction executed:', {
            type: 'send',
            txHash: result.txHash,
            chainId,
            timestamp: Date.now(),
          });
          return {
            txHash: result.txHash,
            explorerUrl:
              result.explorerUrl ||
              `${CHAIN_EXPLORER_URLS[chainId]}/tx/${result.txHash}`,
          };
        }
        case 'recurring_payment': {
          const res = await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(intent),
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create recurring schedule');
          }
          
          const data = await res.json();
          
          console.log('Transaction executed:', {
            type: 'recurring_payment',
            txHash: data.id,
            timestamp: Date.now(),
          });
          
          return {
            txHash: data.id,
            explorerUrl: `/recurring-payments`, // Link to the dashboard instead of an explorer
          };
        }
        default:
          return { error: `Cannot execute intent type: ${intent.type}` };
      }
    },
    [adapter],
  );

  return { estimateIntent, executeIntent, isReady, adapterError };
}

