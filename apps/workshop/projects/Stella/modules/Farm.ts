import type { Address, ModuleDefinitionInterface, Pool, UserPosition } from '@defiyield/sandbox';
import { POOLS, TOKENS } from '../helpers/constants';
import ERC20_ABI from '../abis/erc20.json';
import { BigNumber } from 'ethers';
import { getContractParams, getFetchPoolsPromises } from '../helpers/utils';

export const Farm: ModuleDefinitionInterface = {
  name: 'Farm',
  chain: 'moonbeam',
  type: 'pools',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens(): Promise<Address[]> {
    return [...Object.keys(TOKENS), ...Object.keys(POOLS)];
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools(ctx): Promise<(Pool | void)[]> {
    const { tokens } = ctx;
    const STELLA = tokens.find(
      (token) => token.address === '0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2',
    );
    const ETH = tokens.find(
      (token) => token.address === '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    );

    const {
      stellaPerSec,
      totalAllocPoint,
      stellaDistributorResults,
      stellaDualDistributorResults,
      tradingFeeAprs,
      tradingFeeAPRsOfDualFarms,
      tradingFeeAPRsOfStableDualFarms,
    } = await getContractParams(ctx, ctx.tokens, ETH?.price || 0);

    return await Promise.all(
      getFetchPoolsPromises({
        ctx,
        tokens,
        stellaDistributorResults,
        stellaDualDistributorResults,
        tradingFeeAprs,
        tradingFeeAPRsOfDualFarms,
        tradingFeeAPRsOfStableDualFarms,
        totalAllocPoint,
        stellaPerSec,
        stellaPrice: STELLA?.price || 0,
      }),
    );
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions(ctx): Promise<(UserPosition | void)[]> {
    const { pools, user, ethcall, ethcallProvider } = ctx;
    return await Promise.all(
      pools.map(async (pool) => {
        const contract = new ethcall.Contract(pool.id, ERC20_ABI);
        const [_userBalance] = await ethcallProvider.all<BigNumber>([contract.balanceOf(user)]);
        const userBalance = +_userBalance / 10 ** (pool?.supplied?.[0]?.token?.decimals || 18);

        return {
          id: pool.id,
          supplied:
            pool?.supplied?.map((supply) => ({
              ...supply,
              balance: userBalance,
            })) || [],
        };
      }),
    );
  },
};
