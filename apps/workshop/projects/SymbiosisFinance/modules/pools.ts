import type { FetchPoolsContext, ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool, SupportedChain } from '@defiyield/sandbox';
import omniPoolAbi from '../abis/omniPool.json';
import omniPoolOracleAbi from '../abis/omniPoolOracle.json';
import { OMNI_POOL, POOLS } from '../helpers/config';
import { BOBA_BNB_RPC } from '../helpers/constants';
import { getPoolApr } from '../helpers/utils';

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
    async fetchPools(context: FetchPoolsContext): Promise<(Pool | void)[]> {
      const { tokens, ethers, BigNumber } = context;
      const [token] = tokens;

      /**
       Constantly get user's position from host chain
       where omni pool deployed - BOBA BNB
       */
      const provider = new ethers.providers.JsonRpcProvider(BOBA_BNB_RPC);

      const poolContract = new ethers.Contract(OMNI_POOL.address, omniPoolAbi, provider);
      const asset = await poolContract.indexToAsset(currentPool.poolIndex);

      const lpDelimiter = new BigNumber(10).pow(18);
      const tvl = new BigNumber(asset.cash.toString()).div(lpDelimiter);

      const apr = await getPoolApr(context, currentPool.chainId);

      return [
        {
          id: currentPool.underlyingStable,
          supplied: [
            {
              token,
              tvl: tvl.toNumber(),
              apr: { year: apr },
            },
          ],
        },
      ];
    },

    /**
     * Returns user positions for all pools
     *
     * @param ctx Context
     * @returns UserPosition[]
     */
    async fetchUserPositions({ pools, user, BigNumber, ethers }) {
      const [pool] = pools;

      const { token } = pool.supplied?.[0] || {};
      if (!token) return [];

      /**
       Constantly get user's position from host chain
       where omni pool deployed - BOBA BNB
       */
      const provider = new ethers.providers.JsonRpcProvider(BOBA_BNB_RPC);

      const poolContract = new ethers.Contract(OMNI_POOL.address, omniPoolAbi, provider);
      const lpBalance = await poolContract.balanceOf(user, currentPool.poolIndex);

      const poolOracleContract = new ethers.Contract(OMNI_POOL.oracle, omniPoolOracleAbi, provider);
      const balance = await poolOracleContract.quoteWithdraw(currentPool.poolIndex, lpBalance);

      const tokenDelimiter = new BigNumber(10).pow(token.decimals);
      const position = new BigNumber(balance.amount.toString()).div(tokenDelimiter);

      return [
        {
          id: pool.id,
          supplied: [
            {
              token,
              balance: position.toNumber(),
            },
          ],
        },
      ];
    },
  };
}
