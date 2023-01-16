import type {
  ModuleDefinitionInterface,
  Address,
  Context,
  Pool,
  FetchPoolsContext,
  FetchUserPositionsContext,
  UserPosition
} from '@defiyield/sandbox';
import {getTokenInfo, getTokenInfos} from '../helpers/token-info';
import poolAbi from '../abis/pool-abi.json'
import {ChainSymbol, chainSymbolToSupportedChain} from '../helpers/chain';
import {BigNumber} from 'ethers';

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
      for (const token of ctx.tokens) {
        const tokenInfo = await getTokenInfo(ctx, chainSymbol, token.address);
        if (!tokenInfo) {
          continue
        }

        const poolContract = new ctx.ethcall.Contract(tokenInfo.poolAddress, poolAbi);
        const [tokenBalance] = await ctx.ethcallProvider.all<typeof BigNumber>([poolContract.tokenBalance()])
        const tvl = (+tokenBalance) / SYSTEM_PRECISION;
        const pool: Pool = {
          id: tokenInfo.poolAddress,
          supplied: [
            {
              token: token,
              tvl: tvl * (token.price || 1),
              apr: {year: +tokenInfo.apr},
            },
          ],
          extra: {lpRate: +tokenInfo.lpRate}
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
      for (const pool of ctx.pools) {
        const poolSupplied = pool?.supplied?.[0];
        if (!poolSupplied) {
          continue;
        }
        const poolContract = new ctx.ethcall.Contract(pool.id, poolAbi);
        const [userInfo] = await ctx.ethcallProvider.all<{lpAmount: BigNumber}>([poolContract.userInfo(ctx.user)]);
        const lpBalance = +userInfo.lpAmount / SYSTEM_PRECISION;
        const userPosition: UserPosition = {
          id: pool.id,
          supplied: [
            {...poolSupplied, balance: lpBalance * (pool?.extra?.lpRate as number ?? 1)},
          ],
        };
        result.push(userPosition);
      }
      return result;
    },
  }
}

// 0x01a494079dcb715f622340301463ce50cd69a4d0
