import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { CroSwapFarms, CroSwapTokens, CroSwapToken, Reserves, UserInfo } from '../helpers/types';
import { subgraph } from '../helpers/gql';
import { FetchPoolsContext, TokenExtra, UserPosition } from '../../../../sandbox/src/types/module';
import { Pool } from '@defiyield/sandbox';
import { findToken } from '../../../../../packages/utils/array';
import {
  CROSWAP_FARMS,
  GQL_GET_TOKENS,
  CROSWAP_FARMS_URL,
  CROSWAP_SUBGRAPH_URL,
} from '../helpers/const';
import farmsAbi from '../abis/farms.abi.json';
import pairAbi from '../abis/pair.abi.json';
import { BigNumber, FixedNumber } from 'ethers/lib/ethers';
import { formatUnits } from 'ethers/lib/utils';
import { fetchPoolsFromUrl, preloadTokensFromUrl } from '../helpers/util';

export const CroSwap: ModuleDefinitionInterface = {
  name: 'CroSwap',
  chain: 'cronos',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens(ctx) {
    return await preloadTokensFromUrl(ctx, CROSWAP_SUBGRAPH_URL);
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools(ctx: FetchPoolsContext) {
    return await fetchPoolsFromUrl(ctx, ctx.tokens, CROSWAP_FARMS_URL);
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions(ctx) {
    const { pools, user, ethcall, ethcallProvider, ethers } = ctx;
    const farms = new ethcall.Contract(CROSWAP_FARMS, farmsAbi);

    const positions = pools.flatMap(async (pool) => {
      const token0 = pool.supplied?.[0].token;
      if (!token0) return void 0;

      const token1 = pool.supplied?.[1].token;
      if (!token1) return void 0;

      const lpTokenContract = new ethcall.Contract(pool.id, pairAbi);

      const [poolId, balance, reserves, totalSupply] = (await ethcallProvider.all([
        farms.getPoolIdforLP(pool.id),
        lpTokenContract.balanceOf(user),
        lpTokenContract.getReserves(),
        lpTokenContract.totalSupply(),
      ])) as [BigNumber, BigNumber, Reserves, BigNumber];

      const [userInfo, pending] = (await ethcallProvider.all([
        farms.getUserInfo(poolId, user),
        farms.pendingRewards(poolId, user),
      ])) as [UserInfo, BigNumber];

      // total balance of lp tokens in wallet & staked
      const totalBalance = balance.add(userInfo.amount);

      // dont continue if no balance
      if (totalBalance.eq(0)) return void 0;

      const reserve0 = FixedNumber.fromValue(reserves._reserve0, 18);
      const reserve1 = FixedNumber.fromValue(reserves._reserve1, 18);

      // get ratio of total supply
      const ratioOfTotalSupply = FixedNumber.fromValue(totalBalance).divUnsafe(
        FixedNumber.from(totalSupply),
      );

      const token0Balance = parseFloat(
        formatUnits(reserve0.mulUnsafe(ratioOfTotalSupply).toHexString(), token0.decimals),
      );
      const token1Balance = parseFloat(
        formatUnits(reserve1.mulUnsafe(ratioOfTotalSupply).toHexString(), token1.decimals),
      );

      return <UserPosition>{
        id: pool.id,
        supplied: [
          {
            token: pool.supplied?.[0].token,
            //sucks this is a number
            balance: token0Balance,
          },
          {
            token: pool.supplied?.[1].token,
            //sucks this is a number
            balance: token1Balance,
          },
        ],
        rewarded: [
          {
            token: pool.rewarded?.[0].token,
            //sucks this is a number
            balance: parseFloat(formatUnits(pending, 18)),
          },
        ],
      };
    });

    return await Promise.all(positions);
  },

  /**
   * Returns missing token prices
   *
   * @param ctx Context
   * @returns TokenExtra[]
   */
  async fetchMissingTokenPrices(ctx) {
    return await subgraph<CroSwapTokens>(ctx, 'getTokens', GQL_GET_TOKENS).then((cst) => {
      // Filter out tokens that are not in the assets list
      const tokens = cst.tokens.filter((token: CroSwapToken) => {
        return (
          ctx.assets.find((asset) => token.id.toLowerCase() === asset.address.toLowerCase()) !==
          undefined
        );
      });

      // Return tokens mapped to TokenExtra
      return tokens.map((token: CroSwapToken) => {
        return <TokenExtra>{
          // we have to get address here, as our graphql query returns lowercase addresses
          address: ctx.ethers.utils.getAddress(token.id),
          price: parseFloat(token.tokenDayData[0].priceUSD),
          totalSupply: new ctx.BigNumber(token.totalSupply)
            .div(10 ** parseInt(token.decimals))
            .toString(),
        };
      });
    });
  },
};
