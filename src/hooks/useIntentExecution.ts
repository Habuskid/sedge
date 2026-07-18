'use client';

import { useCallback } from 'react';
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

function buildSwapParams(intent: SwapIntent, adapter: unknown) {
  return {
    from: { adapter, chain: chainName(intent.chainId) },
    tokenIn: intent.fromToken,
    tokenOut: intent.toToken,
    amountIn: intent.amount,
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

  const estimateIntent = useCallback(
    async (intent: ParsedIntent): Promise<EstimationData> => {
      if (!adapter) throw new Error('Wallet not connected');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kit = getAppKit() as any;

      switch (intent.type) {
        case 'swap': {
          const params = buildSwapParams(intent, adapter);
          const est = await kit.estimateSwap(params);
          return {
            estimatedOutput: est.estimatedOutput,
            fees: est.fees,
          };
        }
        case 'bridge': {
          const params = buildBridgeParams(intent, adapter);
          const est = await kit.estimateBridge(params);
          return { fees: est.fees };
        }
        case 'send': {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kit = getAppKit() as any;

      switch (intent.type) {
        case 'swap': {
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
          const params = buildBridgeParams(intent, adapter);
          let result = await kit.bridge(params);

          if (result.state === 'error') {
            result = await kit.retryBridge(result, {
              from: adapter,
              to: adapter,
            });
          }

          if (result.state === 'error') {
            return { error: 'Bridge failed after retry.' };
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
        default:
          return { error: `Cannot execute intent type: ${intent.type}` };
      }
    },
    [adapter],
  );

  return { estimateIntent, executeIntent, isReady, adapterError };
}
