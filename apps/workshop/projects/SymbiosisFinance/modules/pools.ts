import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool, SupportedChain } from '@defiyield/sandbox';
import { POOLS } from '../helpers/config';
import { getPoolApr, getPoolTvl, getUserPosition } from '../helpers/api';

export function getPool(chain: SupportedChain): ModuleDefinitionInterface {
  const currentPool = POOLS[chain];
  if (!currentPool) {
    throw new Error('Unsupported chain');
  }

  return {
    name: `Symbiosis pool: ${chain}`,
    chain,
    type: 'pools',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(): Promise<Address[]> {
      return [currentPool.underlyingStable];
    },

    /**
     * Returns full pool list
     *
     * @param context
     * @returns Pool[]
     */
    async fetchPools(context): Promise<(Pool | void)[]> {
      const { tokens } = context;
      const [token] = tokens;

      const tvl = await getPoolTvl(context, currentPool);
      const apr = await getPoolApr(context, currentPool);

      return [
        {
          id: currentPool.underlyingStable,
          supplied: [
            {
              token,
              tvl,
              apr: { year: apr },
            },
          ],
        },
      ];
    },

    /**
     * Returns user positions for all pools
     *
     * @param context Context
     * @returns UserPosition[]
     */
    async fetchUserPositions(context) {
      const { pools, user } = context;

      const [pool] = pools;

      const { token } = pool.supplied?.[0] || {};
      if (!token) return [];

      const balance = await getUserPosition(context, currentPool, user);

      return [
        {
          id: pool.id,
          supplied: [
            {
              token,
              balance,
            },
          ],
        },
      ];
    },
  };
}
