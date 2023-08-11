import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool as DefiyieldPool, SupportedChain, Token } from '@defiyield/sandbox';
import { getTokensData, getPoolsData, Pool } from '../helpers/index';
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
    async fetchPools(context): Promise<DefiyieldPool[]> {
      const { tokens } = context;
      const pools: DefiyieldPool[] = [];

      const poolsData = await getPoolsData(context, chain);

      poolsData.map((p: Pool) => {
        const assets = p.assets;
        const suppliedTokens = [];

        if (assets.length) {
          for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const _token = tokens.find(
              (t: Token) => t.address.toLowerCase() === asset.underlyingToken.id.toLowerCase(),
            );
            const token =
              _token ??
              ({
                address: asset.underlyingToken.id,
                displayName: asset.underlyingToken.name,
                decimals: Number(asset.underlyingToken.decimals),
                price: Number(asset.underlyingToken.price),
                underlying: [],
              } as Token);

            suppliedTokens.push({
              token,
              tvl: Number(asset.tvlUSD),
              apr: { year: Number(asset.womBaseApr) },
            });
          }

          pools.push({
            id: p.id,
            supplied: suppliedTokens,
          });
        }
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
