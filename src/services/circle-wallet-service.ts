import { circleServer } from '@/lib/circle-server-client';

export class CircleWalletService {
  private static walletSetId: string | null = null;

  /**
   * Initializes or retrieves the primary WalletSet used for Dev-Controlled Wallets
   */
  private static async getWalletSetId(): Promise<string> {
    if (this.walletSetId) return this.walletSetId;

    try {
      const response = await circleServer.listWalletSets();
      if (response.data?.walletSets && response.data.walletSets.length > 0) {
        this.walletSetId = response.data.walletSets[0].id || null;
        if (this.walletSetId) return this.walletSetId;
      }

      // Create a new one if it doesn't exist
      const createResponse = await circleServer.createWalletSet({
        name: 'Sedge SCA Wallets',
      });
      
      if (!createResponse.data?.walletSet?.id) {
        throw new Error('Failed to create wallet set');
      }

      this.walletSetId = createResponse.data.walletSet.id;
      return this.walletSetId;
    } catch (error) {
      console.error('Error getting wallet set:', error);
      throw error;
    }
  }

  /**
   * Creates a Dev-Controlled Smart Contract Account (SCA) on Arc Testnet
   */
  static async createScaWallet(): Promise<{ id: string; address: string; blockchain: string }> {
    try {
      const walletSetId = await this.getWalletSetId();

      const response = await circleServer.createWallets({
        blockchains: ['ARC-TESTNET'],
        count: 1,
        walletSetId,
        accountType: 'SCA',
      });

      const wallet = response.data?.wallets?.[0];
      if (!wallet) {
        throw new Error('Wallet creation failed: no wallet returned');
      }

      return {
        id: wallet.id,
        address: wallet.address,
        blockchain: wallet.blockchain,
      };
    } catch (error) {
      console.error('Error creating SCA wallet:', error);
      throw error;
    }
  }

  /**
   * Executes a transfer (e.g., for recurring payments) from a Dev-Controlled SCA
   */
  static async executeRecurringTransfer({
    walletId,
    tokenId,
    destinationAddress,
    amount,
  }: {
    walletId: string;
    tokenId: string;
    destinationAddress: string;
    amount: string[];
  }): Promise<string> {
    try {
      const response = await circleServer.createTransaction({
        walletId,
        tokenId,
        destinationAddress,
        amount,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      });

      if (!response.data?.id) {
        throw new Error('Failed to initiate transfer');
      }

      return response.data.id;
    } catch (error) {
      console.error('Error executing recurring transfer:', error);
      throw error;
    }
  }
}
