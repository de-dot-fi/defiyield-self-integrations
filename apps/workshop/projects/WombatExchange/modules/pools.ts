import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool, SupportedChain, Token } from '@defiyield/sandbox';
import { getTokensData, getAssetsData } from '../helpers/index';
export function getPools(chain: SupportedChain): ModuleDefinitionInterface {
  return {
    name: `Wombat pool: ${chain}`,
    chain,
    type: 'pools',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(context): Promise<Address[]> {
      return await getTokensData(context, chain);
    },

    /**
     * Returns full pool list
     *
     * @param context
     * @returns Pool[]
     */
    async fetchPools(context): Promise<Pool[]> {
      const { tokens } = context;
      const pools: Pool[] = [];

      const assets = await getAssetsData(context, chain);

      assets.map((a) => {
        const _token = tokens.find(
          (t) => t.address.toLowerCase() === a.underlyingToken.id.toLowerCase(),
        );
        const token =
          _token ??
          ({
            address: a.underlyingToken.id,
            displayName: a.underlyingToken.name,
            decimals: Number(a.underlyingToken.decimals),
            price: Number(a.underlyingToken.price),
            underlying: [],
          } as Token);

        pools.push({
          id: a.id,
          supplied: [
            {
              token,
              tvl: Number(a.tvlUSD),
              apr: { year: Number(a.womBaseApr) },
            },
          ],
        });
      });

      return pools;
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
