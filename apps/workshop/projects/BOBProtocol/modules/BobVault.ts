import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Vaults, Vault } from '../helpers/vaults';
import { SupportedChain } from '@defiyield/sandbox';

export function getBobVault(chain: SupportedChain): ModuleDefinitionInterface {
  const vaults_storage: Vaults = Vaults.getInstance();
  return {
    name: `BobSwap on ${chain}`,
    chain,
    type: 'pools',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @param context
     * @returns Address[]
     */
    async preloadTokens({ axios, logger }) {
      const vault: Vault = await vaults_storage.getVault(chain, axios, logger);
      return await vault.getTokens();
    },

    /**
     * Returns full pool list
     *
     * @param context
     * @returns Pool[]
     */
    async fetchPools({ tokens, axios, logger }) {
      const vault: Vault = await vaults_storage.getVault(chain, axios, logger);
      return await vault.composePoolInfo(tokens);
    },

    /**
     * Returns user positions for all pools
     *
     * @param ctx Context
     * @returns UserPosition[]
     */
    async fetchUserPositions(ctx) {
      // BOBSwap (like PSM) does not provide ability for 3rd parties to provide liquidity
      return [];
    },
  };
}
