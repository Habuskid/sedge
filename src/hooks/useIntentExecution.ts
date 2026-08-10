'use client';

import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useWalletAdapter } from './useWalletAdapter';
import { getAppKit } from '@/lib/app-kit';
import { CHAIN_ID_TO_APP_KIT_NAME, CHAIN_DISPLAY_NAMES, CHAIN_EXPLORER_URLS } from '@/config/chains';
import { parseApiErrorPayload } from '@/lib/user-facing-errors';
import { logException, logWarn } from '@/lib/logger';
import { reportException } from '@/lib/observability';
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

type ChainParam = {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

/**
 * Chain metadata for wallet_addEthereumChain.
 * Returns null when RPC env is missing so UI doesn't crash at module load time.
 */
function getChainParam(chainId: number): ChainParam | null {
  if (chainId === 11155111) {
    const rpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
    if (!rpc) return null;
    return {
      chainId: '0xAA36A7',
      chainName: 'Sepolia',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [rpc],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    };
  }

  if (chainId === 84532) {
    const rpc = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
    if (!rpc) return null;
    return {
      chainId: '0x14A34',
      chainName: 'Base Sepolia',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [rpc],
      blockExplorerUrls: ['https://sepolia.basescan.org'],
    };
  }

  if (chainId === 5042002) {
    const rpc = process.env.NEXT_PUBLIC_ARC_RPC_URL;
    if (!rpc) return null;
    return {
      chainId: '0x4CEF52',
      chainName: 'Arc Testnet',
      nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
      rpcUrls: [rpc],
      blockExplorerUrls: ['https://testnet.arcscan.app'],
    };
  }

  return null;
}

/**
 * Ensures a chain is added to the user's wallet via wallet_addEthereumChain.
 * If the chain already exists, the wallet silently ignores the request.
 * This prevents the bridge mint step from failing when the destination
 * chain is not yet known to the wallet.
 */
async function ensureChainInWallet(provider: any, chainId: number): Promise<void> {
  const params = getChainParam(chainId);
  if (!params) {
    logWarn('intent.chain_param_missing', {
      scope: 'useIntentExecution',
      chainId,
      message: 'Missing RPC env for chain pre-registration',
    });
    return;
  }

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

function getBridgeFailureDetail(result: any): { step?: string; message?: string } {
  const steps: any[] = Array.isArray(result?.steps) ? result.steps : [];
  const failedStep = steps.find((s) => s?.state === 'error');

  const rawError =
    failedStep?.error?.message ||
    failedStep?.error ||
    result?.error?.message ||
    result?.error;

  const message =
    typeof rawError === 'string'
      ? rawError
      : rawError
      ? JSON.stringify(rawError)
      : undefined;

  return {
    step: failedStep?.name,
    message,
  };
}

function isLikelyGasError(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes('insufficient funds') ||
    normalized.includes('intrinsic gas too low') ||
    normalized.includes('out of gas') ||
    normalized.includes('gas required exceeds allowance') ||
    normalized.includes('fee')
  );
}

function isLikelyUserRejected(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes('user rejected') ||
    normalized.includes('rejected request') ||
    normalized.includes('denied') ||
    normalized.includes('cancelled')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        } catch (error) {
          logWarn('intent.provider_unavailable', {
            scope: 'useIntentExecution',
            message: 'Could not get provider for chain pre-registration',
          });
          void reportException(error, {
            scope: 'useIntentExecution',
            code: 'UNKNOWN_ERROR',
          });
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
                logException('intent.chain_switch_failed', retryErr, {
                  targetChainId,
                  scope: 'useIntentExecution',
                });
                void reportException(retryErr, {
                  targetChainId,
                  scope: 'useIntentExecution',
                  code: 'UNKNOWN_ERROR',
                });
                throw new Error(`Please switch to ${chainName(targetChainId)} in your wallet to continue.`);
              }
            } else {
              logException('intent.chain_switch_manual_failed', err, {
                targetChainId,
                scope: 'useIntentExecution',
              });
              void reportException(err, {
                targetChainId,
                scope: 'useIntentExecution',
                code: 'UNKNOWN_ERROR',
              });
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
            // Some App Kit builds may not expose retry(). Guard it to avoid runtime crashes.
            const retryFn = (kit as any)?.retry;
            if (typeof retryFn === 'function') {
              const maxRetries = 6;

              for (let attempt = 1; attempt <= maxRetries && result.state === 'error'; attempt++) {
                const failure = getBridgeFailureDetail(result);
                const isFatalGasError = failure.step === 'mint' && isLikelyGasError(failure.message);
                const isFatalUserRejection = isLikelyUserRejected(failure.message);

                if (isFatalGasError || isFatalUserRejection) {
                  logWarn('intent.bridge_retry_stopped_fatal', {
                    scope: 'useIntentExecution',
                    attempt,
                    failedStep: failure.step,
                    failedMessage: failure.message,
                    reason: isFatalGasError ? 'gas_error' : 'user_rejected',
                  });
                  break;
                }

                const delayMs = Math.min(2_000 * attempt, 10_000);
                logWarn('intent.bridge_retrying', {
                  scope: 'useIntentExecution',
                  attempt,
                  delayMs,
                  failedStep: failure.step,
                  failedMessage: failure.message,
                });

                await sleep(delayMs);

                result = await retryFn(result, {
                  from: adapter,
                  to: adapter,
                });
              }
            } else {
              const requestId = crypto.randomUUID();
              logWarn('intent.bridge_retry_unavailable', {
                scope: 'useIntentExecution',
                requestId,
              });
              return {
                error: 'Bridge route is temporarily unavailable. Please try again.',
                errorCode: 'BRIDGE_TEMP_UNAVAILABLE',
                requestId,
              };
            }
          }

          if (result.state === 'error') {
            const requestId = crypto.randomUUID();
            const failure = getBridgeFailureDetail(result);

            logException('intent.bridge_failed', result.error, {
              requestId,
              scope: 'useIntentExecution',
              intentType: 'bridge',
              fromChainId: intent.fromChainId,
              toChainId: intent.toChainId,
              failedStep: failure.step,
              failedMessage: failure.message,
            });
            logWarn('intent.bridge_failed_detail', {
              requestId,
              scope: 'useIntentExecution',
              fromChainId: intent.fromChainId,
              toChainId: intent.toChainId,
              failedStep: failure.step,
              failedMessage: failure.message,
              detail: JSON.stringify(result, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
              2),
            });
            void reportException(result.error, {
              requestId,
              scope: 'useIntentExecution',
              code: 'BRIDGE_TEMP_UNAVAILABLE',
              intentType: 'bridge',
            });

            const isMintFailure = failure.step === 'mint';
            const destinationChain = CHAIN_DISPLAY_NAMES[intent.toChainId] || `Chain ${intent.toChainId}`;
            const likelyGasError = isLikelyGasError(failure.message);
            const friendlyError = isMintFailure && likelyGasError
              ? `Mint failed on ${destinationChain}. Please ensure this wallet has gas token on the destination chain, then retry and approve all wallet prompts.`
              : isMintFailure
              ? `Mint failed on ${destinationChain}. Please retry and approve all wallet prompts.`
              : 'Bridge route is temporarily unavailable. Please try again.';

            return {
              error: friendlyError,
              errorCode: 'BRIDGE_TEMP_UNAVAILABLE',
              requestId,
            };
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
          if (!address) {
            throw new Error('Please connect your wallet before creating a recurring payment.');
          }

          const res = await fetch('/api/schedules', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'x-wallet-address': address,
            },
            body: JSON.stringify(intent),
          });
          
          if (!res.ok) {
            const payload = await res.json().catch(() => null);
            const parsed = parseApiErrorPayload(payload);
            return {
              error: parsed.message,
              errorCode: parsed.code,
              requestId: parsed.requestId,
            };
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

