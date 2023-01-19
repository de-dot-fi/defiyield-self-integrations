import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { CroSwapFarms, CroSwapTokens, CroSwapToken, Reserves, UserInfo } from '../helpers/types';
import { subgraph } from '../helpers/gql';
import { FetchPoolsContext, TokenExtra, UserPosition } from '../../../../sandbox/src/types/module';
import { Pool } from '@defiyield/sandbox';
import { findToken } from '../../../../../packages/utils/array';
import { CROSWAP_FARMS, GQL_GET_TOKENS } from '../helpers/const';
import farmsAbi from '../abis/farms.abi.json';
import pairAbi from '../abis/pair.abi.json';
import { BigNumber, FixedNumber } from 'ethers/lib/ethers';
import { formatUnits } from 'ethers/lib/utils';

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
    return await subgraph<CroSwapTokens>(ctx, 'getTokens', GQL_GET_TOKENS).then((cst) => {
      return cst.tokens.map((token: any) => token.id);
    });
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, axios }: FetchPoolsContext) {
    const finder = findToken(tokens);

    return await axios({
      url: 'https://api.croswap.com/v2/farms',
      method: 'GET',
    }).then((response: { data: any }) => {
      const pools = [];

      const entries = Object.entries<CroSwapFarms>(response.data);

      for (const [, value] of entries) {
        pools.push(<Pool>{
          id: value.pair.pairAddress,
          supplied: [
            {
              token: finder(value.pair.address0),
              tvl: parseFloat(value.pair.reserve0USD),
            },
            {
              token: finder(value.pair.address1),
              tvl: parseFloat(value.pair.reserve1USD),
            },
          ],
        });
      }
      return pools;
    });
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

      const [userInfo] = (await ethcallProvider.all([farms.getUserInfo(poolId, user)])) as [
        UserInfo,
      ];

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
