import {
  FetchUserPositionsContext,
  TokenUnderlying,
  UserPosition,
  UserSupplied,
  PoolSupplied,
  PoolRewarded,
} from './../../../../sandbox/src/types/module';
import { Zero } from './../helpers/constant';

import {
  CHAINLINK_ORACLE_ADDR,
  COMPOSITION_TOKENS,
  PLP_STAKING_ADDR,
  PLP_STAKING_REVENUE_ADDR,
  PLP_TOKEN_ADDR,
  POOL_DIAMOND_ADDR,
} from './../helpers/config';
import { createMulticallChunker } from '@defiyield/utils/array';
import type { FetchPoolsContext, ModuleDefinitionInterface } from '@defiyield/sandbox';
import { tokenAddresses } from '../helpers/config';
import GetterFacetAbi from '../abis/GetterFacet.json';
import PLPStakingAbi from '../abis/PLPStaking.json';
import FeedableRewarderAbi from '../abis/FeedableRewarder.json';
import PoolOracleAbi from '../abis/PoolOracle.json';

import { parseEther, parseUnits } from 'ethers/lib/utils';
import { BigNumber, ethers } from 'ethers';

import { e18 } from '../helpers/constant';
import { calAPR, getPLPPrice, getTokenOraclePrice, toFixed } from '../helpers/calculation';

export const PLPStaking: ModuleDefinitionInterface = {
  name: 'PLPStaking',
  chain: 'polygon',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens() {
    return tokenAddresses;
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools(ctx: FetchPoolsContext) {
    const { tokens, ethcall, ethcallProvider, logger } = ctx;
    const filteredTokens = tokens.filter((i) => i.address.toLowerCase() !== PLP_TOKEN_ADDR);

    const multiCall = createMulticallChunker(ethcallProvider);

    const apr = await calAPR(ctx);

    const multiCallRes = await multiCall(Object.values(COMPOSITION_TOKENS), (token) => {
      const contract = new ethcall.Contract(POOL_DIAMOND_ADDR, GetterFacetAbi);
      return [contract.liquidityOf(token)];
    });

    const tokenAddrs = Object.values(COMPOSITION_TOKENS);

    if (tokenAddrs.length !== multiCallRes.length) {
      throw new Error(`Invalid Multicall Result`);
    }

    let mapAddrWithResult: Record<string, BigNumber> = {};
    for (let i = 0; i < Object.values(COMPOSITION_TOKENS).length; i++) {
      mapAddrWithResult[tokenAddrs[i].toLowerCase()] = multiCallRes[i];
    }

    const plpToken = {
      name: 'PLP Token',
      symbol: 'PLP',
      icon: 'https://app.perp88.com/static/media/plp.8abb46909eb3f94836db629ab557c8f6.svg',
      address: PLP_TOKEN_ADDR,
      decimals: 18,
      displayName: 'PLP',
      price: parseFloat((await getPLPPrice(ctx)).displayPrice),
      underlying: filteredTokens.map(
        (i) =>
          ({
            reserve: mapAddrWithResult[i.address.toLowerCase()],
            ...i,
          } as unknown as TokenUnderlying),
      ),
      chainId: 3, //polygon inernal chainId
    };

    const usdcToken = tokens.find(
      (i) => i.address.toLowerCase() === COMPOSITION_TOKENS.USDC.toLowerCase(),
    );

    const tvlBN = plpToken.underlying
      ? plpToken.underlying.reduce((accum, curr) => {
          if (!curr.reserve || !curr.price) return accum;

          const tvlBN = parseEther(curr.reserve.toString())
            .mul(parseEther(curr.price.toString()))
            .div(e18)
            .div(parseUnits('1', curr.decimals));

          return accum.add(tvlBN);
        }, Zero)
      : Zero;

    const poolSupplied: PoolSupplied[] = [
      {
        token: plpToken,
        apr: {
          year: parseFloat(toFixed(apr)) / 100, //defiyield apr need to display value * 100
        },
        tvl: parseFloat(ethers.utils.formatEther(tvlBN)),
      } as PoolSupplied,
    ];

    const poolRewarded: PoolRewarded[] = [
      {
        token: usdcToken,
      } as PoolRewarded,
    ];

    return [
      {
        id: 'PLP POOL',
        supplied: poolSupplied,
        rewarded: poolRewarded,
      },
    ];
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions(ctx: FetchUserPositionsContext): Promise<(UserPosition | void)[]> {
    const { ethcall, ethcallProvider, user, logger, pools } = ctx;

    const plpStakingContract = new ethcall.Contract(PLP_STAKING_ADDR, PLPStakingAbi);
    const rewardContract = new ethcall.Contract(PLP_STAKING_REVENUE_ADDR, FeedableRewarderAbi);

    const [plpBalance, pendingReward]: BigNumber[] = (await ethcallProvider.all([
      plpStakingContract.getUserTokenAmount(PLP_TOKEN_ADDR, user),
      rewardContract.pendingReward(user),
    ])) as BigNumber[];
    const plpPoolSupplied =
      pools.length === 0 || pools[0].supplied?.length === 0
        ? undefined
        : {
            ...pools[0].supplied![0],
            balance: parseFloat(ethers.utils.formatEther(plpBalance)),
          };

    const plpPoolRewarded =
      pools.length === 0 || pools[0].rewarded?.length === 0
        ? undefined
        : {
            ...pools[0].rewarded![0],
            balance: parseFloat(ethers.utils.formatUnits(pendingReward, 6)), //USDC REWARD
          };

    return [
      {
        id: 'PLP POOL User Staking',
        supplied: plpPoolSupplied ? [plpPoolSupplied] : undefined,
        rewarded: plpPoolRewarded ? [plpPoolRewarded] : undefined,
      },
    ];
  },
};
