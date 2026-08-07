'use client';

import { useReadContracts, useAccount } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { arcTestnet, TOKEN_ADDRESSES } from '@/config/chains';

/**
 * Shared hook that fetches USDC + EURC ERC-20 balances on Arc Testnet
 * via a single multicall RPC round-trip.
 *
 * Exposes `refetch()` which returns a Promise — callers can
 * `await refetch()` to guarantee fresh data before reading balances.
 */
export function useCrossChainBalances() {
  const { address, isConnected } = useAccount();

  const contracts = [
    {
      address: TOKEN_ADDRESSES[arcTestnet.id].USDC!,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: address ? [address] as const : undefined,
      chainId: arcTestnet.id,
    },
    {
      address: TOKEN_ADDRESSES[arcTestnet.id].EURC!,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: address ? [address] as const : undefined,
      chainId: arcTestnet.id,
    },
  ];

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: isConnected && !!address },
  });

  const usdcRaw = data?.[0]?.status === 'success' ? (data[0].result as bigint) : undefined;
  const eurcRaw = data?.[1]?.status === 'success' ? (data[1].result as bigint) : undefined;

  const usdcBalance = usdcRaw !== undefined
    ? parseFloat(formatUnits(usdcRaw, 6))
    : 0;

  const eurcBalance = eurcRaw !== undefined
    ? parseFloat(formatUnits(eurcRaw, 6))
    : 0;

  const usdcFormatted = usdcBalance.toFixed(2);
  const eurcFormatted = eurcBalance.toFixed(2);

  /**
   * Await this to get guaranteed-fresh balances from the RPC.
   * Returns { usdc, eurc } as formatted strings.
   */
  const fetchFreshBalances = async (): Promise<{ usdc: string; eurc: string }> => {
    const result = await refetch();
    const freshData = result.data;

    const freshUsdc = freshData?.[0]?.status === 'success'
      ? parseFloat(formatUnits(freshData[0].result as bigint, 6)).toFixed(2)
      : '0.00';

    const freshEurc = freshData?.[1]?.status === 'success'
      ? parseFloat(formatUnits(freshData[1].result as bigint, 6)).toFixed(2)
      : '0.00';

    return { usdc: freshUsdc, eurc: freshEurc };
  };

  return {
    usdcBalance,
    eurcBalance,
    usdcFormatted,
    eurcFormatted,
    isLoading,
    refetch: fetchFreshBalances,
  };
}
