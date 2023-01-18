import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { CroSwapFarms, CroSwapTokens, CroSwapToken, Reserves, UserInfo } from '../helpers/types';
import { subgraph } from '../helpers/gql';
import { FetchPoolsContext, TokenExtra, UserPosition } from '../../../../sandbox/src/types/module';
import { Pool } from '@defiyield/sandbox';
import { findToken } from '../../../../../packages/utils/array';
import { CROSWAP_FARMS, GQL_GET_TOKENS } from '../helpers/const';
import farmsAbi from '../abis/farms.abi.json';
import pairAbi from '../abis/pair.abi.json';
import { BigNumber } from 'ethers/lib/ethers';

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

      const [poolId, balance, reserves] = (await ethcallProvider.all([
        farms.getPoolIdforLP(pool.id),
        lpTokenContract.balanceOf(user),
        lpTokenContract.getReserves(),
      ])) as [BigNumber, BigNumber, Reserves];

      const [userInfo] = (await ethcallProvider.all([farms.getUserInfo(poolId, user)])) as [
        UserInfo,
      ];

      // total balance of lp tokens in wallet & staked
      const totalBalance = parseFloat(ethers.utils.formatEther(balance.add(userInfo.amount)));

      // dont continue if no balance
      if (totalBalance === 0) return void 0;

      // gotta scale up so we don't lose precision
      const scale = BigNumber.from(10).pow(18);
      const reserve0 = reserves._reserve0;
      const reserve1 = reserves._reserve1;

      // get ratios for each side of the pool
      const token0Ratio = parseFloat(ethers.utils.formatEther(reserve0.mul(scale).div(reserve1)));
      const token1Ratio = 1 / token0Ratio;

      // calculate balance of each token based on owned lp tokens
      const token0Balance = totalBalance * token0Ratio;
      const token1Balance = totalBalance * token1Ratio;

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
