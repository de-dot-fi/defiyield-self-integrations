import type {
  ModuleDefinitionInterface,
  Address,
  Context,
  Pool,
  FetchPoolsContext,
  FetchUserPositionsContext,
  UserPosition
} from '@defiyield/sandbox';
import {getTokenInfos} from '../helpers/token-info';
import poolAbi from '../abis/pool-abi.json'
import {ChainSymbol, chainSymbolToSupportedChain} from '../helpers/chain';
import type {BigNumber} from 'ethers';

const SYSTEM_PRECISION = 1e3;

export function getAllbridgeModule(chainSymbol: ChainSymbol): ModuleDefinitionInterface {
  return {
    name: `Allbridge Core ${chainSymbol}`,
    chain: chainSymbolToSupportedChain(chainSymbol),
    type: 'pools',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @param ctx
     * @returns Address[]
     */
    async preloadTokens(ctx: Context): Promise<Address[]> {
      const tokenInfo = await getTokenInfos(ctx, chainSymbol)
      return tokenInfo.map(info => info.tokenAddress);
    },

    /**
     * Returns full pool list
     *
     * @param ctx
     * @returns Pool[]
     */
    async fetchPools(ctx: FetchPoolsContext): Promise<Pool[]> {
      const result: Pool[] = [];

      // filter out tokens to make looping simpler later
      const tokens = []
      const tokenInfos = await getTokenInfos(ctx, chainSymbol)
      for (const token of ctx.tokens) {
        const tokenInfo = tokenInfos.find(t => t.tokenAddress.toLowerCase() === token.address.toLowerCase());
        if (!tokenInfo) {
          continue
        }

        tokens.push({token: token, info: tokenInfo});
      }

      // queue up all balance requests
      const calls = []
      for (const token of tokens) {
        const poolContract = new ctx.ethcall.Contract(token.info.poolAddress, poolAbi);
        calls.push(poolContract.tokenBalance());
      }

      // get balance for every token in a single rpc call
      const tokenBalances = await ctx.ethcallProvider.all<BigNumber>(calls);

      for (const token of tokens) {
        const tvl = (+(tokenBalances.shift() || 0)) / SYSTEM_PRECISION;
        const pool: Pool = {
          id: token.info.poolAddress,
          supplied: [
            {
              token: token.token,
              tvl: tvl * (token.token.price || 1),
              apr: {year: +token.info.apr},
            },
          ],
          extra: {lpRate: +token.info.lpRate}
        };
        result.push(pool);
      }
      return result;
    },

    /**
     * Returns user positions for all pools
     *
     * @param ctx Context
     * @returns UserPosition[]
     */
    async fetchUserPositions(ctx: FetchUserPositionsContext): Promise<UserPosition[]> {
      const result: UserPosition[] = [];

      // filter out pools to make looping simpler later
      const pools = [];
      for (const pool of ctx.pools) {
        const poolSupplied = pool?.supplied?.[0];
        if (!poolSupplied) {
          continue;
        }
        pools.push({pool, supplied: poolSupplied});
      }

      // queue up all user info requests
      const calls = []
      for (const pool of pools) {
        const poolContract = new ctx.ethcall.Contract(pool.pool.id, poolAbi);
        calls.push(poolContract.userInfo(ctx.user));
      }

      // get user info for every pool in a single rpc call
      const userInfos = await ctx.ethcallProvider.all<{ lpAmount: BigNumber }>(calls);

      for (const pool of pools) {
        const userInfo = userInfos.shift() || {lpAmount: new ctx.BigNumber(0)}
        const lpBalance = +userInfo.lpAmount / SYSTEM_PRECISION;
        const userPosition: UserPosition = {
          id: pool.pool.id,
          supplied: [
            {...pool.supplied, balance: lpBalance * (pool.pool.extra?.lpRate as number ?? 1)},
          ],
        };
        result.push(userPosition);
      }
      return result;
    },
  }
}
