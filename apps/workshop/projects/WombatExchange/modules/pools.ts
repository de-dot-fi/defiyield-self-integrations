import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool, SupportedChain } from '@defiyield/sandbox';
import { getPools } from '../helpers/ index';

export function getPool(chain: SupportedChain): ModuleDefinitionInterface {
  // const currentPool = POOLS[chain];
  // if (!currentPool) {
  //   throw new Error('Unsupported chain');
  // }

  return {
    name: `Wombat pool: ${chain}`,
    chain,
    type: 'pools',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(): Promise<Address[]> {
      return [];
    },

    /**
     * Returns full pool list
     *
     * @param context
     * @returns Pool[]
     */
    async fetchPools(context): Promise<Pool[]> {
      return await getPools(context, chain);
    },

    /**
     * Returns user positions for all pools
     *
     * @param context Context
     * @returns UserPosition[]
     */
    async fetchUserPositions(context) {
      return [];
    },
  };
}
