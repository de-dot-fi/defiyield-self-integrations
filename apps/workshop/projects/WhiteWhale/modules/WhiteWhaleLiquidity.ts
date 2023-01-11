import type { ModuleDefinitionInterface, TokenDetail } from '@defiyield/sandbox';
import { getContracts, getContractUnderlying } from '../helpers';

export const WhiteWhaleLiquidity: ModuleDefinitionInterface = {
  name: 'WhiteWhaleLiquidity',
  chain: 'juno',
  type: 'pools',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens(ctx) {
    return await getContracts(ctx);
  },

  async fetchMissingTokenDetails(ctx) {
    const underlying = await getContractUnderlying(ctx);
    if (Array.isArray(underlying)) {
      return <TokenDetail>{
        decimals: 6,
        address: ctx.address,
        underlying,
      };
    }
    return void 0;
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools(ctx) {
    const { tokens } = ctx;
    return tokens.map((token) => {
      return {
        id: token.address,
        supplied: [
          {
            token,
            tvl: 0,
          },
        ],
      };
    });
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions(ctx) {
    // TODO: Fetch User Positions
    return [];
  },
};
